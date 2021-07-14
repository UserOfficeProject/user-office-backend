import { UserVisit } from '../../models/UserVisit';
import { Visit, VisitStatus } from '../../models/Visit';
import { UpdateVisitArgs } from '../../resolvers/mutations/UpdateVisitMutation';
import { VisitsFilter } from '../../resolvers/queries/VisitsQuery';
import { VisitDataSource } from '../VisitDataSource';
import { CreateVisitArgs } from './../../resolvers/mutations/CreateVisitMutation';
import { dummyUserWithRole } from './UserDataSource';

export class VisitDataSourceMock implements VisitDataSource {
  private visits: Visit[];
  init() {
    this.visits = [
      new Visit(
        1,
        1,
        VisitStatus.DRAFT,
        1,
        dummyUserWithRole.id,
        1,
        1,
        new Date()
      ),
    ];
  }

  async getVisit(visitId: number): Promise<Visit | null> {
    return this.visits.find((visit) => visit.id === visitId) ?? null;
  }
  getVisits(filter?: VisitsFilter): Promise<Visit[]> {
    throw new Error('Method not implemented.');
  }
  getUserVisits(visitId: number): Promise<UserVisit[]> {
    throw new Error('Method not implemented.');
  }
  getVisitByScheduledEventId(eventId: number): Promise<Visit | null> {
    throw new Error('Method not implemented.');
  }
  async createVisit(
    { proposalPk, scheduledEventId, teamLeadUserId }: CreateVisitArgs,
    visitorId: number,
    questionaryId: number
  ): Promise<Visit> {
    const newVisit = new Visit(
      this.visits.length,
      proposalPk,
      VisitStatus.DRAFT,
      questionaryId,
      visitorId,
      teamLeadUserId,
      scheduledEventId,
      new Date()
    );

    this.visits.push(newVisit);

    return newVisit;
  }
  async updateVisit(args: UpdateVisitArgs): Promise<Visit> {
    this.visits = this.visits.map((visit) => {
      if (visit && visit.id === args.visitId) {
        args.status && (visit.status = args.status);
      }

      return visit;
    });

    return (await this.getVisit(args.visitId))!;
  }
  async deleteVisit(visitId: number): Promise<Visit> {
    return this.visits.splice(
      this.visits.findIndex((visit) => visit.id == visitId),
      1
    )[0];
  }

  async isVisitorOfProposal(
    visitorId: number,
    proposalPk: number
  ): Promise<boolean> {
    return false;
  }
}
