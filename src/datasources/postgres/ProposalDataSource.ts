import { logger } from '@esss-swap/duo-logger';
import BluePromise from 'bluebird';
import { Transaction } from 'knex';
import { injectable } from 'tsyringe';

import { Event } from '../../events/event.enum';
import { Proposal, ProposalIdsWithNextStatus } from '../../models/Proposal';
import { ProposalView } from '../../models/ProposalView';
import { getQuestionDefinition } from '../../models/questionTypes/QuestionRegistry';
import { ProposalDataSource } from '../ProposalDataSource';
import { ProposalsFilter } from './../../resolvers/queries/ProposalsQuery';
import database from './database';
import {
  CallRecord,
  createProposalObject,
  createProposalViewObject,
  ProposalEventsRecord,
  ProposalRecord,
  ProposalViewRecord,
  StatusChangingEventRecord,
} from './records';

@injectable()
export default class PostgresProposalDataSource implements ProposalDataSource {
  async submitProposal(id: number): Promise<Proposal> {
    return database
      .update(
        {
          submitted: true,
        },
        ['*']
      )
      .from('proposals')
      .where('proposal_id', id)
      .then((proposal: ProposalRecord[]) => {
        if (proposal === undefined || proposal.length !== 1) {
          throw new Error(`Failed to submit proposal with id '${id}'`);
        }

        return createProposalObject(proposal[0]);
      });
  }

  async deleteProposal(id: number): Promise<Proposal> {
    return database('proposals')
      .where('proposals.proposal_id', id)
      .del()
      .from('proposals')
      .returning('*')
      .then((proposal: ProposalRecord[]) => {
        if (proposal === undefined || proposal.length !== 1) {
          throw new Error(`Could not delete proposal with id:${id}`);
        }

        return createProposalObject(proposal[0]);
      });
  }

  async setProposalUsers(id: number, users: number[]): Promise<void> {
    return database.transaction(function (trx: Transaction) {
      return database
        .from('proposal_user')
        .where('proposal_id', id)
        .del()
        .transacting(trx)
        .then(() => {
          return BluePromise.map(users, (user_id: number) => {
            return database
              .insert({ proposal_id: id, user_id: user_id })
              .into('proposal_user')
              .transacting(trx);
          });
        })
        .then(() => {
          trx.commit;
        })
        .catch((error) => {
          trx.rollback;
          throw error; // re-throw
        });
    });
  }

  async update(proposal: Proposal): Promise<Proposal> {
    return database
      .update(
        {
          title: proposal.title,
          abstract: proposal.abstract,
          proposer_id: proposal.proposerId,
          status_id: proposal.statusId,
          created_at: proposal.created,
          updated_at: proposal.updated,
          short_code: proposal.shortCode,
          final_status: proposal.finalStatus,
          call_id: proposal.callId,
          questionary_id: proposal.questionaryId,
          comment_for_user: proposal.commentForUser,
          comment_for_management: proposal.commentForManagement,
          notified: proposal.notified,
          submitted: proposal.submitted,
          management_time_allocation: proposal.managementTimeAllocation,
          management_decision_submitted: proposal.managementDecisionSubmitted,
        },
        ['*']
      )
      .from('proposals')
      .where('proposal_id', proposal.id)
      .then((records: ProposalRecord[]) => {
        if (records === undefined || !records.length) {
          throw new Error(`Proposal not found ${proposal.id}`);
        }

        return createProposalObject(records[0]);
      });
  }

  async updateProposalStatus(
    proposalId: number,
    proposalStatusId: number
  ): Promise<Proposal> {
    return database
      .update(
        {
          status_id: proposalStatusId,
        },
        ['*']
      )
      .from('proposals')
      .where('proposal_id', proposalId)
      .then((records: ProposalRecord[]) => {
        if (records === undefined || !records.length) {
          throw new Error(`Proposal not found ${proposalId}`);
        }

        return createProposalObject(records[0]);
      });
  }

  async get(id: number): Promise<Proposal | null> {
    return database
      .select()
      .from('proposals')
      .where('proposal_id', id)
      .first()
      .then((proposal: ProposalRecord) => {
        return proposal ? createProposalObject(proposal) : null;
      });
  }

  async create(
    proposer_id: number,
    call_id: number,
    questionary_id: number
  ): Promise<Proposal> {
    return database
      .insert({ proposer_id, call_id, questionary_id, status_id: 1 }, ['*'])
      .from('proposals')
      .then((resultSet: ProposalRecord[]) => {
        return createProposalObject(resultSet[0]);
      });
  }

  async getProposalsFromView(
    filter?: ProposalsFilter
  ): Promise<ProposalView[]> {
    return database
      .select()
      .from('proposal_table_view')
      .modify((query) => {
        if (filter?.callId) {
          query.where('proposal_table_view.call_id', filter?.callId);
        }
        if (filter?.instrumentId) {
          query.where(
            'proposal_table_view.instrument_id',
            filter?.instrumentId
          );
        }

        if (filter?.proposalStatusId) {
          query.where(
            'proposal_table_view.proposal_status_id',
            filter?.proposalStatusId
          );
        }

        if (filter?.shortCodes) {
          const filteredAndPreparedShortCodes = filter?.shortCodes
            .filter((shortCode) => shortCode)
            .join('|');

          query.whereRaw(
            `proposal_table_view.short_code similar to '%(${filteredAndPreparedShortCodes})%'`
          );
        }
        if (filter?.questionFilter) {
          const questionFilter = filter.questionFilter;
          const questionFilterQuery = getQuestionDefinition(
            questionFilter.dataType
          ).filterQuery;
          if (!questionFilterQuery) {
            throw new Error(
              `Filter query not implemented for ${filter.questionFilter.dataType}`
            );
          }
          query
            .leftJoin(
              'answers',
              'answers.questionary_id',
              'proposal_table_view.questionary_id'
            )
            .andWhere('answers.question_id', questionFilter.questionId)
            .modify(questionFilterQuery, questionFilter);
        }
      })
      .then((proposals: ProposalViewRecord[]) => {
        return proposals.map((proposal) => createProposalViewObject(proposal));
      });
  }

  async getProposals(
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }> {
    return database
      .select(['proposals.*', database.raw('count(*) OVER() AS full_count')])
      .from('proposals')
      .orderBy('proposals.proposal_id', 'desc')
      .modify((query) => {
        if (filter?.text) {
          query
            .where('title', 'ilike', `%${filter.text}%`)
            .orWhere('abstract', 'ilike', `%${filter.text}%`);
        }

        if (filter?.questionaryIds) {
          query.whereIn('proposals.questionary_id', filter.questionaryIds);
        }
        if (filter?.callId) {
          query.where('proposals.call_id', filter.callId);
        }
        if (filter?.instrumentId) {
          query
            .leftJoin(
              'instrument_has_proposals',
              'instrument_has_proposals.proposal_id',
              'proposals.proposal_id'
            )
            .where(
              'instrument_has_proposals.instrument_id',
              filter.instrumentId
            );
        }

        if (filter?.proposalStatusId) {
          query.where('proposals.status_id', filter?.proposalStatusId);
        }

        if (filter?.shortCodes) {
          const filteredAndPreparedShortCodes = filter?.shortCodes
            .filter((shortCode) => shortCode)
            .join('|');

          query.whereRaw(
            `proposals.short_code similar to '%(${filteredAndPreparedShortCodes})%'`
          );
        }

        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((proposals: ProposalRecord[]) => {
        const props = proposals.map((proposal) =>
          createProposalObject(proposal)
        );

        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposals: props,
        };
      });
  }

  async getInstrumentScientistProposals(
    scientistId: number,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }> {
    return database
      .select([
        'proposals.*',
        'instrument_has_scientists.*',
        'instrument_has_proposals.instrument_id',
        'instrument_has_proposals.proposal_id',
        database.raw('count(*) OVER() AS full_count'),
      ])
      .from('proposals')
      .join('instrument_has_scientists', {
        'instrument_has_scientists.user_id': scientistId,
      })
      .join('instrument_has_proposals', {
        'instrument_has_proposals.proposal_id': 'proposals.proposal_id',
        'instrument_has_proposals.instrument_id':
          'instrument_has_scientists.instrument_id',
      })
      .orderBy('proposals.proposal_id', 'desc')
      .modify((query) => {
        if (filter?.text) {
          query
            .where('title', 'ilike', `%${filter.text}%`)
            .orWhere('abstract', 'ilike', `%${filter.text}%`);
        }
        if (filter?.callId) {
          query.where('proposals.call_id', filter.callId);
        }
        if (filter?.instrumentId) {
          query.where(
            'instrument_has_proposals.instrument_id',
            filter.instrumentId
          );
        }

        if (filter?.proposalStatusId) {
          query.where('proposals.status_id', filter?.proposalStatusId);
        }

        if (filter?.shortCodes) {
          const filteredAndPreparedShortCodes = filter?.shortCodes
            .filter((shortCode) => shortCode)
            .join('|');

          query.whereRaw(
            `proposals.short_code similar to '%(${filteredAndPreparedShortCodes})%'`
          );
        }

        if (filter?.questionFilter) {
          const questionFilter = filter.questionFilter;
          const questionFilterQuery = getQuestionDefinition(
            questionFilter.dataType
          ).filterQuery;
          if (!questionFilterQuery) {
            throw new Error(
              `Filter query not implemented for ${filter.questionFilter.dataType}`
            );
          }
          query
            .leftJoin(
              'answers',
              'answers.questionary_id',
              'proposals.questionary_id'
            )
            .andWhere('answers.question_id', questionFilter.questionId)
            .modify(questionFilterQuery, questionFilter);
        }

        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((proposals: ProposalRecord[]) => {
        const props = proposals.map((proposal) =>
          createProposalObject(proposal)
        );

        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposals: props,
        };
      });
  }

  async getUserProposals(
    id: number,
    filter?: { instrumentId?: number | null }
  ): Promise<Proposal[]> {
    return database
      .select('p.*')
      .from('proposals as p')
      .leftJoin('proposal_user as pc', {
        'p.proposal_id': 'pc.proposal_id',
      })
      .where('pc.user_id', id)
      .orWhere('p.proposer_id', id)
      .modify((qb) => {
        if (filter?.instrumentId) {
          qb.innerJoin('instrument_has_proposals as ihp', {
            'p.proposal_id': 'ihp.proposal_id',
          });
          qb.where('ihp.instrument_id', filter.instrumentId);
        }
      })
      .groupBy('p.proposal_id')
      .then((proposals: ProposalRecord[]) =>
        proposals.map((proposal) => createProposalObject(proposal))
      );
  }

  async markEventAsDoneOnProposal(
    event: Event,
    proposalId: number
  ): Promise<ProposalEventsRecord | null> {
    const dataToInsert = {
      proposal_id: proposalId,
      [event.toLowerCase()]: true,
    };

    const result = await database.raw(
      `? ON CONFLICT (proposal_id)
        DO UPDATE SET
        ${event.toLowerCase()} = true
        RETURNING *;`,
      [database('proposal_events').insert(dataToInsert)]
    );

    if (result.rows && result.rows.length) {
      return result.rows[0];
    } else {
      return null;
    }
  }

  async getCount(callId: number): Promise<number> {
    return database('proposals')
      .count('call_id')
      .where('call_id', callId)
      .first()
      .then((result: { count?: string | undefined } | undefined) => {
        return parseInt(result?.count || '0');
      });
  }

  async cloneProposal(sourceProposal: Proposal): Promise<Proposal> {
    const [newProposal]: ProposalRecord[] = (
      await database.raw(`
      INSERT INTO proposals
      (
        title,
        abstract,
        status_id,
        proposer_id,
        created_at,
        updated_at,
        final_status,
        call_id,
        questionary_id,
        comment_for_management,
        comment_for_user,
        notified,
        submitted,
        management_decision_submitted,
        management_time_allocation
      )
      SELECT
        title,
        abstract,
        status_id,
        proposer_id,
        created_at,
        updated_at,
        final_status,
        call_id,
        questionary_id,
        comment_for_management,
        comment_for_user,
        notified,
        submitted,
        management_decision_submitted,
        management_time_allocation
      FROM 
        proposals
      WHERE
        proposal_id = ${sourceProposal.id}
      RETURNING *
    `)
    ).rows;

    return createProposalObject(newProposal);
  }

  async resetProposalEvents(
    proposalId: number,
    callId: number,
    statusId: number
  ): Promise<boolean> {
    const proposalCall: CallRecord = await database('call')
      .select('*')
      .where('call_id', callId)
      .first();

    if (!proposalCall) {
      logger.logError(
        'Could not reset proposal events because proposal call does not exist',
        { callId }
      );

      throw new Error('Could not reset proposal events');
    }

    const proposalEventsToReset: StatusChangingEventRecord[] = (
      await database.raw(`
        SELECT 
          *
        FROM 
          proposal_workflow_connections AS pwc
        JOIN
          status_changing_events
        ON
          status_changing_events.proposal_workflow_connection_id = pwc.proposal_workflow_connection_id
        WHERE pwc.proposal_workflow_connection_id >= (
          SELECT proposal_workflow_connection_id
          FROM proposal_workflow_connections
          WHERE proposal_workflow_id = ${proposalCall.proposal_workflow_id}
          AND proposal_status_id = ${statusId}
        )
        AND pwc.proposal_workflow_id = ${proposalCall.proposal_workflow_id};
      `)
    ).rows;

    if (proposalEventsToReset?.length) {
      const dataToUpdate = proposalEventsToReset
        .map(
          (event) =>
            `${event.status_changing_event.toLocaleLowerCase()} = false`
        )
        .join(', ');

      const [updatedProposalEvents]: ProposalEventsRecord[] = (
        await database.raw(`
        UPDATE proposal_events SET ${dataToUpdate}
        WHERE proposal_id = ${proposalId}
        RETURNING *
      `)
      ).rows;

      if (!updatedProposalEvents) {
        logger.logError('Could not reset proposal events', { dataToUpdate });

        throw new Error('Could not reset proposal events');
      }
    }

    return true;
  }

  async changeProposalsStatus(
    statusId: number,
    proposalIds: number[]
  ): Promise<ProposalIdsWithNextStatus> {
    const dataToUpdate: { status_id: number; submitted?: boolean } = {
      status_id: statusId,
    };

    // NOTE: If status is DRAFT re-open the proposal for submission
    if (statusId === 1) {
      dataToUpdate.submitted = false;
    }

    const result: ProposalRecord[] = await database
      .update(dataToUpdate, ['*'])
      .from('proposals')
      .whereIn('proposal_id', proposalIds);

    if (result?.length === 0) {
      logger.logError('Could not change proposals status', { dataToUpdate });

      throw new Error('Could not change proposals status');
    }

    return new ProposalIdsWithNextStatus(
      result.map((item) => item.proposal_id)
    );
  }
}
