import { container, inject, injectable } from 'tsyringe';

import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Authorized } from '../decorators';
import { Review } from '../models/Review';
import { Roles } from '../models/Role';
import { TechnicalReview } from '../models/TechnicalReview';
import { UserWithRole } from '../models/User';

@injectable()
export default class ReviewQueries {
  private userAuth = container.resolve(UserAuthorization);
  private proposalAuth = container.resolve(ProposalAuthorization);

  constructor(
    @inject(Tokens.ReviewDataSource) public dataSource: ReviewDataSource
  ) {}

  @Authorized()
  async get(
    agent: UserWithRole | null,
    { reviewId, sepId }: { reviewId: number; sepId?: number | null }
  ): Promise<Review | null> {
    const review = await this.dataSource.getReview(reviewId);
    if (!review) {
      return null;
    }

    if (
      review.userID === agent?.id ||
      this.userAuth.isUserOfficer(agent) ||
      (sepId && (await this.userAuth.isChairOrSecretaryOfSEP(agent, sepId))) ||
      (await this.proposalAuth.isReviewerOfProposal(agent, review.proposalPk))
    ) {
      return review;
    } else {
      return null;
    }
  }

  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
  async reviewsForProposal(
    agent: UserWithRole | null,
    proposalPk: number
  ): Promise<Review[] | null> {
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.proposalAuth.isChairOrSecretaryOfProposal(agent, proposalPk))
    ) {
      return null;
    }

    return this.dataSource.getProposalReviews(proposalPk);
  }

  @Authorized()
  async technicalReviewForProposal(
    agent: UserWithRole | null,
    proposalPk: number
  ): Promise<TechnicalReview | null> {
    if (
      this.userAuth.isUserOfficer(agent) ||
      (await this.proposalAuth.isScientistToProposal(agent, proposalPk)) ||
      (await this.proposalAuth.isChairOrSecretaryOfProposal(agent, proposalPk))
    ) {
      return this.dataSource.getTechnicalReview(proposalPk);
    } else if (
      await this.proposalAuth.isReviewerOfProposal(agent, proposalPk)
    ) {
      const review = await this.dataSource.getTechnicalReview(proposalPk);
      if (review) {
        review.comment = '';
      }

      return review;
    } else {
      return null;
    }
  }
}
