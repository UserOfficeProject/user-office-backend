import {
  reviewDataSource,
  sepDataSource,
  userDataSource,
} from '../datasources';
import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import { SEPDataSourceMock } from '../datasources/mockups/SEPDataSource';
import { UserDataSourceMock } from '../datasources/mockups/UserDataSource';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Proposal } from '../models/Proposal';
import { Roles } from '../models/Role';
import { User, UserRole, UserWithRole } from '../models/User';

export class UserAuthorization {
  constructor(
    private userDataSource: UserDataSource,
    private reviewDataSource: ReviewDataSource,
    private sepDataSource: SEPDataSource
  ) {}

  async isUserOfficer(agent: UserWithRole | null) {
    if (agent == null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.USER_OFFICER;
  }

  // NOTE: This is not a good check if it is a user or not. It should do the same check as isUserOfficer.
  async isUser(agent: User | null, id: number) {
    if (agent == null) {
      return false;
    }
    if (agent.id !== id) {
      return false;
    }

    return true;
  }

  async hasRole(agent: UserWithRole | null, role: string): Promise<boolean> {
    if (agent == null) {
      return false;
    }

    return this.userDataSource.getUserRoles(agent.id).then(roles => {
      return roles.some(roleItem => roleItem.shortCode === role);
    });
  }

  async isMemberOfProposal(agent: User | null, proposal: Proposal | null) {
    if (agent == null || proposal == null) {
      return false;
    }
    if (agent.id === proposal.proposerId) {
      return true;
    }

    return this.userDataSource.getProposalUsers(proposal.id).then(users => {
      return users.some(user => user.id === agent.id);
    });
  }

  async isReviewerOfProposal(agent: User | null, proposalID: number) {
    if (agent == null) {
      return false;
    }

    return this.reviewDataSource.getUserReviews(agent.id).then(reviews => {
      return reviews.some(review => review.proposalID === proposalID);
    });
  }

  async isScientistToProposal(agent: User | null, proposalID: number) {
    if (agent == null) {
      return false;
    }

    return this.userDataSource
      .checkScientistToProposal(agent.id, proposalID)
      .then(result => {
        return result;
      });
  }

  async isSampleSafetyReviewer(agent: UserWithRole | null) {
    if (agent == null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.SAMPLE_SAFETY_REVIEWER;
  }

  async hasAccessRights(
    agent: UserWithRole | null,
    proposal: Proposal
  ): Promise<boolean> {
    return (
      (await this.isUserOfficer(agent)) ||
      (await this.isMemberOfProposal(agent, proposal)) ||
      (await this.isReviewerOfProposal(agent, proposal.id)) ||
      (await this.isScientistToProposal(agent, proposal.id)) ||
      (await this.isChairOrSecretaryOfProposal(agent?.id!, proposal.id))
    );
  }

  async isChairOrSecretaryOfSEP(
    userId: number,
    sepId: number
  ): Promise<boolean> {
    if (!userId || !sepId) {
      return false;
    }

    return this.sepDataSource.getSEPUserRoles(userId, sepId).then(roles => {
      return roles.some(
        role =>
          role.id === UserRole.SEP_CHAIR || role.id === UserRole.SEP_SECRETARY
      );
    });
  }

  async isChairOrSecretaryOfProposal(userId: number, proposalId: number) {
    if (!userId || !proposalId) {
      return false;
    }

    return this.sepDataSource
      .getSEPProposalUserRoles(userId, proposalId)
      .then(roles => {
        return roles.some(
          role =>
            role.id === UserRole.SEP_CHAIR || role.id === UserRole.SEP_SECRETARY
        );
      });
  }
}

let userDataSourceInstance: UserDataSource = userDataSource;
let reviewDataSourceInstance: ReviewDataSource = reviewDataSource;
let sepDataSourceInstance: SEPDataSource = sepDataSource;

if (process.env.NODE_ENV === 'test') {
  userDataSourceInstance = new UserDataSourceMock();
  reviewDataSourceInstance = new ReviewDataSourceMock();
  sepDataSourceInstance = new SEPDataSourceMock();
}

export const userAuthorization = new UserAuthorization(
  userDataSourceInstance,
  reviewDataSourceInstance,
  sepDataSourceInstance
);
