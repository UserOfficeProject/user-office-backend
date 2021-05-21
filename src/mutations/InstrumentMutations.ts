import {
  createInstrumentValidationSchema,
  updateInstrumentValidationSchema,
  deleteInstrumentValidationSchema,
  assignProposalsToInstrumentValidationSchema,
  removeProposalFromInstrumentValidationSchema,
  assignScientistsToInstrumentValidationSchema,
  removeScientistFromInstrumentValidationSchema,
  setAvailabilityTimeOnInstrumentValidationSchema,
  submitInstrumentValidationSchema,
} from '@esss-swap/duo-validation';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { InstrumentDataSource } from '../datasources/InstrumentDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { Authorized, EventBus, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { Instrument, InstrumentHasProposals } from '../models/Instrument';
import { ProposalIdsWithNextStatus } from '../models/Proposal';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import {
  AssignProposalsToInstrumentArgs,
  RemoveProposalsFromInstrumentArgs,
} from '../resolvers/mutations/AssignProposalsToInstrumentMutation';
import {
  RemoveScientistFromInstrumentArgs,
  AssignScientistsToInstrumentArgs,
} from '../resolvers/mutations/AssignScientistsToInstrument';
import { CreateInstrumentArgs } from '../resolvers/mutations/CreateInstrumentMutation';
import {
  UpdateInstrumentArgs,
  InstrumentAvailabilityTimeArgs,
  InstrumentSubmitArgs,
} from '../resolvers/mutations/UpdateInstrumentMutation';
import { sortByRankOrAverageScore } from '../utils/mathFunctions';
import { UserAuthorization } from '../utils/UserAuthorization';
import { ProposalDataSource } from './../datasources/ProposalDataSource';
@injectable()
export default class InstrumentMutations {
  constructor(
    @inject(Tokens.InstrumentDataSource)
    private dataSource: InstrumentDataSource,
    @inject(Tokens.SEPDataSource) private sepDataSource: SEPDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @ValidateArgs(createInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async create(
    agent: UserWithRole | null,
    args: CreateInstrumentArgs
  ): Promise<Instrument | Rejection> {
    return this.dataSource
      .create(args)
      .then((result) => result)
      .catch((error) => {
        return rejection(
          'Could not create instrument',
          { agent, shortCode: args.shortCode },
          error
        );
      });
  }

  @ValidateArgs(updateInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async update(
    agent: UserWithRole | null,
    args: UpdateInstrumentArgs
  ): Promise<Instrument | Rejection> {
    return this.dataSource
      .update(args)
      .then((result) => result)
      .catch((error) => {
        return rejection(
          'Could not update instrument',
          { agent, instrumentId: args.id },
          error
        );
      });
  }

  @ValidateArgs(deleteInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    args: { id: number }
  ): Promise<Instrument | Rejection> {
    return this.dataSource
      .delete(args.id)
      .then((result) => result)
      .catch((error) => {
        return rejection(
          'Could not delete instrument',
          { agent, instrumentId: args.id },
          error
        );
      });
  }

  async checkIfProposalsAreOnSameCallAsInstrument(
    inputArguments: AssignProposalsToInstrumentArgs
  ) {
    const proposalCallIds = inputArguments.proposals.map(
      (proposal) => proposal.callId
    );
    const proposalCallsWithInstrument = await this.dataSource.getCallsByInstrumentId(
      inputArguments.instrumentId,
      proposalCallIds
    );

    const proposalsOnSameCallAsInstrument = inputArguments.proposals.filter(
      (proposal) =>
        proposalCallsWithInstrument.some(
          (call) => call.callId === proposal.callId
        )
    );

    return (
      proposalsOnSameCallAsInstrument.length === inputArguments.proposals.length
    );
  }

  @EventBus(Event.PROPOSAL_INSTRUMENT_SELECTED)
  @ValidateArgs(assignProposalsToInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async assignProposalsToInstrument(
    agent: UserWithRole | null,
    args: AssignProposalsToInstrumentArgs
  ): Promise<ProposalIdsWithNextStatus | Rejection> {
    const allProposalsAreOnSameCallAsInstrument = await this.checkIfProposalsAreOnSameCallAsInstrument(
      args
    );

    if (!allProposalsAreOnSameCallAsInstrument) {
      return rejection(
        'One or more proposals can not be assigned to instrument, because instrument is not in the call',
        { args }
      );
    }

    const instrument = await this.dataSource.get(args.instrumentId);

    if (!instrument) {
      return rejection(
        'Cannot assign the proposal to the instrument because the proposals call has no such instrument',
        { agent, args }
      );
    }

    const proposalIds = args.proposals.map((proposal) => proposal.id);

    await this.proposalDataSource.updateProposalTechnicalReviewer({
      userId: instrument.managerUserId,
      proposalIds: proposalIds,
    });

    return this.dataSource
      .assignProposalsToInstrument(proposalIds, args.instrumentId)
      .then((result) => result)
      .catch((error) => {
        return rejection(
          'Could not assign proposal/s to instrument',
          { agent, args },
          error
        );
      });
  }

  @ValidateArgs(removeProposalFromInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async removeProposalFromInstrument(
    agent: UserWithRole | null,
    args: RemoveProposalsFromInstrumentArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .removeProposalFromInstrument(args.proposalId, args.instrumentId)
      .then((result) => result)
      .catch((error) => {
        return rejection(
          'Could not remove assigned proposal/s from instrument',
          { agent, args },
          error
        );
      });
  }

  @ValidateArgs(assignScientistsToInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async assignScientsitsToInstrument(
    agent: UserWithRole | null,
    args: AssignScientistsToInstrumentArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .assignScientistsToInstrument(args.scientistIds, args.instrumentId)
      .then((result) => result)
      .catch((error) => {
        return rejection(
          'Could not assign scientist/s to instrument',
          { agent, args },
          error
        );
      });
  }

  @ValidateArgs(removeScientistFromInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async removeScientistFromInstrument(
    agent: UserWithRole | null,
    args: RemoveScientistFromInstrumentArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .removeScientistFromInstrument(args.scientistId, args.instrumentId)
      .then((result) => result)
      .catch((error) => {
        return rejection(
          'Could not remove assigned scientist/s from instrument',
          { agent, args },
          error
        );
      });
  }

  @ValidateArgs(setAvailabilityTimeOnInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async setAvailabilityTimeOnInstrument(
    agent: UserWithRole | null,
    args: InstrumentAvailabilityTimeArgs
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .setAvailabilityTimeOnInstrument(
        args.callId,
        args.instrumentId,
        args.availabilityTime
      )
      .then((result) => result)
      .catch((error) => {
        return rejection(
          'Could not set availability time on instrument',
          { agent, args },
          error
        );
      });
  }

  @EventBus(Event.PROPOSAL_INSTRUMENT_SUBMITTED)
  @ValidateArgs(submitInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
  async submitInstrument(
    agent: UserWithRole | null,
    args: InstrumentSubmitArgs
  ): Promise<InstrumentHasProposals | Rejection> {
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfSEP(agent, args.sepId))
    ) {
      return rejection('Submitting instrument is not permitted', {
        agent,
        args,
      });
    }

    const allInstrumentProposals = await this.sepDataSource.getSEPProposalsByInstrument(
      args.sepId,
      args.instrumentId,
      args.callId
    );

    const submittedInstrumentProposalIds = allInstrumentProposals.map(
      (sepInstrumentProposal) => sepInstrumentProposal.proposalId
    );

    const sepProposalsWithReviewsAndRanking = await this.sepDataSource.getSepProposalsWithReviewGradesAndRanking(
      submittedInstrumentProposalIds
    );

    const allSepMeetingsHasRankings = sepProposalsWithReviewsAndRanking.every(
      (sepProposalWithReviewsAndRanking) =>
        !!sepProposalWithReviewsAndRanking.rankOrder
    );

    if (!allSepMeetingsHasRankings) {
      const sortedSepProposals = sortByRankOrAverageScore(
        sepProposalsWithReviewsAndRanking
      );

      const allProposalsWithRankings = sortedSepProposals.map(
        (sortedSepProposal, index) => {
          if (!sortedSepProposal.rankOrder) {
            sortedSepProposal.rankOrder = index + 1;
          }

          return sortedSepProposal;
        }
      );

      await Promise.all(
        allProposalsWithRankings.map((proposalWithRanking) => {
          return this.sepDataSource.saveSepMeetingDecision({
            proposalId: proposalWithRanking.proposalId,
            rankOrder: proposalWithRanking.rankOrder,
          });
        })
      );
    }

    return this.dataSource
      .submitInstrument(submittedInstrumentProposalIds, args.instrumentId)
      .then((result) => result)
      .catch((error) => {
        return rejection('Could not submit instrument', { agent, args }, error);
      });
  }
}
