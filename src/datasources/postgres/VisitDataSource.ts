import { UserVisit } from '../../models/UserVisit';
import { Visit } from '../../models/Visit';
import { CreateVisitArgs } from '../../resolvers/mutations/CreateVisitMutation';
import { UpdateVisitArgs } from '../../resolvers/mutations/UpdateVisitMutation';
import { VisitDataSource } from '../VisitDataSource';
import { VisitsFilter } from './../../resolvers/queries/VisitsQuery';
import database from './database';
import {
  createUserVisitObject,
  createVisitObject,
  VisitRecord,
} from './records';

class PostgresVisitDataSource implements VisitDataSource {
  getUserVisits(visitId: number): Promise<UserVisit[]> {
    return database('visits_has_users')
      .where({ visit_id: visitId })
      .then((userVisits) =>
        userVisits.map((userVisit) => createUserVisitObject(userVisit))
      );
  }
  getVisits(filter?: VisitsFilter): Promise<Visit[]> {
    return database('visits')
      .select('*')
      .modify((query) => {
        if (filter?.visitorId) {
          query.where('visitor_id', filter.visitorId);
        }
        if (filter?.questionaryId) {
          query.where('questionary_id', filter.questionaryId);
        }
        if (filter?.proposalPk) {
          query.where('proposal_pk', filter.proposalPk);
        }
      })
      .then((visits: VisitRecord[]) =>
        visits.map((visit) => createVisitObject(visit))
      );
  }
  getVisit(visitId: number): Promise<Visit | null> {
    return database('visits')
      .select('*')
      .where({ visit_id: visitId })
      .first()
      .then((visit) => (visit ? createVisitObject(visit) : null));
  }

  getVisitByScheduledEventId(eventId: number): Promise<Visit | null> {
    return database('visits')
      .select('*')
      .where({ scheduled_event_id: eventId })
      .first()
      .then((visit) => (visit ? createVisitObject(visit) : null));
  }

  createVisit(
    { proposalPk, scheduledEventId, teamLeadUserId }: CreateVisitArgs,
    visitorId: number,
    questionaryId: number
  ): Promise<Visit> {
    return database('visits')
      .insert({
        proposal_pk: proposalPk,
        visitor_id: visitorId,
        questionary_id: questionaryId,
        scheduled_event_id: scheduledEventId,
        team_lead_user_id: teamLeadUserId,
      })
      .returning('*')
      .then((visit) => createVisitObject(visit[0]));
  }

  updateVisit(args: UpdateVisitArgs): Promise<Visit> {
    return database
      .transaction(async (trx) => {
        if (args.team) {
          await database('visits_has_users')
            .delete()
            .where({ visit_id: args.visitId })
            .transacting(trx);

          await database('visits_has_users')
            .insert(
              args.team.map((userId) => ({
                visit_id: args.visitId,
                user_id: userId,
              }))
            )
            .transacting(trx);
        }
        if (args.status || args.proposalPkAndEventId || args.teamLeadUserId) {
          await database('visits')
            .update({
              status: args.status,
              proposal_pk: args.proposalPkAndEventId?.proposalPK,
              scheduled_event_id: args.proposalPkAndEventId?.scheduledEventId,
              team_lead_user_id: args?.teamLeadUserId,
            })
            .where({ visit_id: args.visitId })
            .transacting(trx);
        }
      })
      .then(async () => {
        const updatedVisit = await this.getVisit(args.visitId);
        if (!updatedVisit) {
          throw new Error('Updated visit not found');
        }

        return updatedVisit;
      });
  }

  deleteVisit(visitId: number): Promise<Visit> {
    return database('visits')
      .where({ visit_id: visitId })
      .delete()
      .returning('*')
      .then((result) => {
        return createVisitObject(result[0]);
      });
  }

  isVisitorOfProposal(visitorId: number, proposalPk: number): Promise<boolean> {
    return database
      .select('*')
      .from('visits_has_users')
      .whereIn('visit_id', function () {
        this.select('visit_id').from('visits').where('proposal_pk', proposalPk);
      })
      .andWhere('visits_has_users.user_id', visitorId)
      .then((results) => results.length > 0);
  }
}

export default PostgresVisitDataSource;
