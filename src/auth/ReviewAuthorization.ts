import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { UserWithRole } from '../models/User';
import { Review } from '../resolvers/types/Review';
import { ProposalAuthorization } from './ProposalAuthorization';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class ReviewAuthorization {
  private proposalAuth = container.resolve(ProposalAuthorization);
  private userAuth = container.resolve(UserAuthorization);
  constructor(
    @inject(Tokens.ReviewDataSource)
    private reviewDataSource: ReviewDataSource
  ) {}

  private async resolveReview(
    reviewOrReviewId: Review | number
  ): Promise<Review | null> {
    let review;

    if (typeof reviewOrReviewId === 'number') {
      review = await this.reviewDataSource.getReview(reviewOrReviewId);
    } else {
      review = reviewOrReviewId;
    }

    return review;
  }

  async hasReadRights(
    agent: UserWithRole | null,
    review: Review
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    reviewId: number
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    reviewOrReviewId: Review | number
  ): Promise<boolean> {
    const review = await this.resolveReview(reviewOrReviewId);
    if (!review) {
      return false;
    }

    const isUserOfficer = await this.userAuth.isUserOfficer(agent);
    if (isUserOfficer) {
      return true;
    }

    const isAuthor = review.userID === agent?.id;
    if (isAuthor) {
      return true;
    }

    const isChairOrSecretaryOfSEP = await this.userAuth.isChairOrSecretaryOfSEP(
      agent,
      review.sepID
    );
    if (isChairOrSecretaryOfSEP) {
      return true;
    }

    const isReviewerOfProposal = await this.proposalAuth.isReviewerOfProposal(
      agent,
      review.proposalPk
    );
    if (isReviewerOfProposal) {
      return true;
    }

    return false;
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    review: Review
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    reviewId: number
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    reviewOrReviewId: Review | number
  ): Promise<boolean> {
    const review = await this.resolveReview(reviewOrReviewId);
    if (!review) {
      return false;
    }

    const isUserOfficer = this.userAuth.isUserOfficer(agent);
    if (isUserOfficer) {
      return true;
    }

    const isChairOrSecretaryOfSEP = await this.userAuth.isChairOrSecretaryOfSEP(
      agent,
      review.sepID
    );
    if (isChairOrSecretaryOfSEP) {
      return true;
    }

    const isReviewerOfProposal = await this.proposalAuth.isReviewerOfProposal(
      agent,
      review.proposalPk
    );
    if (isReviewerOfProposal) {
      return true;
    }

    return false;
  }
}
