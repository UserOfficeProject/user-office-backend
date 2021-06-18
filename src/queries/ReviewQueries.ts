import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { Authorized } from '../decorators';
import { Review } from '../models/Review';
import { Roles } from '../models/Role';
import { TechnicalReview } from '../models/TechnicalReview';
import { UserWithRole } from '../models/User';
import { UserAuthorization } from '../utils/UserAuthorization';

@injectable()
export default class ReviewQueries {
  constructor(
    @inject(Tokens.ReviewDataSource) public dataSource: ReviewDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
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
      review.userID === agent!.id ||
      this.userAuth.isUserOfficer(agent) ||
      (sepId && (await this.userAuth.isChairOrSecretaryOfSEP(agent, sepId))) ||
      (await this.userAuth.isReviewerOfProposal(agent, review.proposalPK))
    ) {
      return review;
    } else {
      return null;
    }
  }

  @Authorized([Roles.USER_OFFICER, Roles.SEP_CHAIR, Roles.SEP_SECRETARY])
  async reviewsForProposal(
    agent: UserWithRole | null,
    proposalPK: number
  ): Promise<Review[] | null> {
    if (
      !this.userAuth.isUserOfficer(agent) &&
      !(await this.userAuth.isChairOrSecretaryOfProposal(agent, proposalPK))
    ) {
      return null;
    }

    return this.dataSource.getProposalReviews(proposalPK);
  }

  @Authorized()
  async technicalReviewForProposal(
    agent: UserWithRole | null,
    proposalPK: number
  ): Promise<TechnicalReview | null> {
    if (
      this.userAuth.isUserOfficer(agent) ||
      (await this.userAuth.isScientistToProposal(agent, proposalPK)) ||
      (await this.userAuth.isChairOrSecretaryOfProposal(agent, proposalPK))
    ) {
      return this.dataSource.getTechnicalReview(proposalPK);
    } else if (await this.userAuth.isReviewerOfProposal(agent, proposalPK)) {
      const review = await this.dataSource.getTechnicalReview(proposalPK);
      if (review) {
        review.comment = '';
      }

      return review;
    } else {
      return null;
    }
  }
}
