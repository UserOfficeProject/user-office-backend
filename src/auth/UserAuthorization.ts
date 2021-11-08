import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Proposal } from '../models/Proposal';
import { Roles } from '../models/Role';
import { User, UserWithRole } from '../models/User';
import { ProposalDataSource } from './../datasources/ProposalDataSource';
import { VisitDataSource } from './../datasources/VisitDataSource';

@injectable()
export class UserAuthorization {
  constructor(
    @inject(Tokens.UserDataSource) private userDataSource: UserDataSource,
    @inject(Tokens.ReviewDataSource) private reviewDataSource: ReviewDataSource,
    @inject(Tokens.SEPDataSource) private sepDataSource: SEPDataSource,
    @inject(Tokens.VisitDataSource) private visitDataSource: VisitDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource
  ) {}

  // User officer has access
  isUserOfficer(agent: UserWithRole | null) {
    if (agent == null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.USER_OFFICER;
  }

  isUser(agent: UserWithRole | null) {
    if (agent == null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.USER;
  }

  async hasRole(agent: UserWithRole | null, role: string): Promise<boolean> {
    if (agent == null) {
      return false;
    }

    return this.userDataSource.getUserRoles(agent.id).then((roles) => {
      return roles.some((roleItem) => roleItem.shortCode === role);
    });
  }

  isPrincipalInvestigatorOfProposal(
    agent: User | null,
    proposal: Proposal | null
  ) {
    if (agent == null || proposal == null) {
      return false;
    }
    if (agent.id === proposal.proposerId) {
      return true;
    }
  }

  async isMemberOfProposal(
    agent: User | null,
    proposalPk: number
  ): Promise<boolean>;
  async isMemberOfProposal(
    agent: User | null,
    proposal: Proposal | null
  ): Promise<boolean>;
  async isMemberOfProposal(
    agent: User | null,
    proposalOrPk: Proposal | number | null
  ) {
    if (agent == null || proposalOrPk == null) {
      return false;
    }

    let proposal: Proposal;
    if (typeof proposalOrPk === 'number') {
      const proposalFromDb = await this.proposalDataSource.get(proposalOrPk);
      if (!proposalFromDb) {
        return false;
      }
      proposal = proposalFromDb;
    } else {
      proposal = proposalOrPk;
    }

    if (this.isPrincipalInvestigatorOfProposal(agent, proposal)) {
      return true;
    }

    return this.userDataSource
      .getProposalUsers(proposal.primaryKey)
      .then((users) => {
        return users.some((user) => user.id === agent.id);
      });
  }

  async isReviewerOfProposal(agent: UserWithRole | null, proposalPk: number) {
    if (agent == null || !agent.id || !agent.currentRole) {
      return false;
    }

    const sepsUserIsMemberOf =
      await this.sepDataSource.getUserSepsByRoleAndSepId(
        agent.id,
        agent.currentRole
      );

    const sepIdsUserIsMemberOf = sepsUserIsMemberOf.map((sep) => sep.id);

    /**
     * NOTE: Everybody who is on a(member of) SEP(Scientific evaluation panel) is able to view and review a proposal.
     * If we like to limit that we can just send userId on the getUserReviews and query for reviews that are only on that specific user.
     */
    return this.reviewDataSource
      .getUserReviews(sepIdsUserIsMemberOf)
      .then((reviews) => {
        return reviews.some((review) => review.proposalPk === proposalPk);
      });
  }

  async isScientistToProposal(agent: User | null, proposalPk: number) {
    if (agent == null || !agent.id) {
      return false;
    }

    return this.userDataSource
      .checkScientistToProposal(agent.id, proposalPk)
      .then((result) => {
        return result;
      });
  }

  async isSampleSafetyReviewer(agent: UserWithRole | null) {
    if (agent == null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.SAMPLE_SAFETY_REVIEWER;
  }

  private async resolveProposal(
    proposalOrProposalId: Proposal | number
  ): Promise<Proposal | null> {
    let proposal;

    if (typeof proposalOrProposalId === 'number') {
      proposal = await this.proposalDataSource.get(proposalOrProposalId);
    } else {
      proposal = proposalOrProposalId;
    }

    return proposal;
  }
  async hasAccessRights(
    agent: UserWithRole | null,
    proposal: Proposal
  ): Promise<boolean>;
  async hasAccessRights(
    agent: UserWithRole | null,
    proposalId: number
  ): Promise<boolean>;
  async hasAccessRights(
    agent: UserWithRole | null,
    proposalOrProposalId: Proposal | number
  ): Promise<boolean> {
    if (!agent) {
      return false;
    }

    const proposal = await this.resolveProposal(proposalOrProposalId);

    if (!proposal) {
      return false;
    }

    return (
      this.isUserOfficer(agent) ||
      this.hasGetAccessByToken(agent) ||
      (await this.isMemberOfProposal(agent, proposal)) ||
      (await this.isReviewerOfProposal(agent, proposal.primaryKey)) ||
      (await this.isScientistToProposal(agent, proposal.primaryKey)) ||
      (await this.isChairOrSecretaryOfProposal(agent, proposal.primaryKey)) ||
      (await this.isVisitorOfProposal(agent, proposal.primaryKey))
    );
  }
  isVisitorOfProposal(
    agent: UserWithRole,
    proposalPk: number
  ): boolean | PromiseLike<boolean> {
    return this.visitDataSource.isVisitorOfProposal(agent.id, proposalPk);
  }

  async isChairOrSecretaryOfSEP(
    agent: User | null,
    sepId: number
  ): Promise<boolean> {
    if (agent == null || !agent.id || !sepId) {
      return false;
    }

    return this.sepDataSource.isChairOrSecretaryOfSEP(agent.id, sepId);
  }

  async isChairOrSecretaryOfProposal(agent: User | null, proposalPk: number) {
    if (agent == null || !agent.id || !proposalPk) {
      return false;
    }

    return this.sepDataSource.isChairOrSecretaryOfProposal(
      agent.id,
      proposalPk
    );
  }

  hasGetAccessByToken(agent: UserWithRole) {
    return !!agent.accessPermissions?.['ProposalQueries.get'];
  }

  async isMemberOfSEP(
    agent: UserWithRole | null,
    sepId: number
  ): Promise<boolean> {
    if (agent == null || !agent.currentRole) {
      return false;
    }

    const [sep] = await this.sepDataSource.getUserSepsByRoleAndSepId(
      agent.id,
      agent.currentRole,
      sepId
    );

    return sep !== null;
  }
}
