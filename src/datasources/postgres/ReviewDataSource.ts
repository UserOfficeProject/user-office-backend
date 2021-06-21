import { Review, ReviewStatus } from '../../models/Review';
import { TechnicalReview } from '../../models/TechnicalReview';
import { AddReviewArgs } from '../../resolvers/mutations/AddReviewMutation';
import { AddTechnicalReviewInput } from '../../resolvers/mutations/AddTechnicalReviewMutation';
import { AddUserForReviewArgs } from '../../resolvers/mutations/AddUserForReviewMutation';
import { SubmitTechnicalReviewInput } from '../../resolvers/mutations/SubmitTechnicalReviewMutation';
import { ReviewDataSource } from '../ReviewDataSource';
import database from './database';
import { ReviewRecord, TechnicalReviewRecord } from './records';

export default class PostgresReviewDataSource implements ReviewDataSource {
  private createReviewObject(review: ReviewRecord) {
    return new Review(
      review.review_id,
      review.proposal_pk,
      review.user_id,
      review.comment,
      review.grade,
      review.status,
      review.sep_id
    );
  }

  private createTechnicalReviewObject(technicalReview: TechnicalReviewRecord) {
    return new TechnicalReview(
      technicalReview.technical_review_id,
      technicalReview.proposal_pk,
      technicalReview.comment,
      technicalReview.public_comment,
      technicalReview.time_allocation,
      technicalReview.status,
      technicalReview.submitted,
      technicalReview.reviewer_id
    );
  }

  async setTechnicalReview(
    args: AddTechnicalReviewInput | SubmitTechnicalReviewInput,
    shouldUpdateReview: boolean
  ): Promise<TechnicalReview> {
    const {
      proposalPk,
      comment,
      publicComment,
      timeAllocation,
      status,
      reviewerId,
      submitted = false,
    } = args;

    if (shouldUpdateReview) {
      return database
        .update({
          proposal_pk: proposalPk,
          comment,
          public_comment: publicComment,
          time_allocation: timeAllocation,
          status,
          submitted,
          reviewer_id: reviewerId,
        })
        .from('technical_review')
        .where('proposal_pk', proposalPk)
        .returning('*')
        .then((records: TechnicalReviewRecord[]) =>
          this.createTechnicalReviewObject(records[0])
        );
    }

    return database
      .insert({
        proposal_pk: proposalPk,
        comment,
        public_comment: publicComment,
        time_allocation: timeAllocation,
        status,
        submitted,
        reviewer_id: reviewerId,
      })
      .returning('*')
      .into('technical_review')
      .then((records: TechnicalReviewRecord[]) =>
        this.createTechnicalReviewObject(records[0])
      );
  }

  async getTechnicalReview(id: number): Promise<TechnicalReview | null> {
    return database
      .select()
      .from('technical_review')
      .where('proposal_pk', id)
      .first()
      .then((review: TechnicalReviewRecord) => {
        if (review === undefined) {
          return null;
        }

        return this.createTechnicalReviewObject(review);
      });
  }

  async getReview(id: number): Promise<Review | null> {
    return database
      .select()
      .from('SEP_Reviews')
      .where('review_id', id)
      .first()
      .then((review: ReviewRecord) => this.createReviewObject(review));
  }

  async getAssignmentReview(sepId: number, proposalPk: number, userId: number) {
    return database
      .select()
      .from('SEP_Reviews')
      .where('sep_id', sepId)
      .andWhere('proposal_pk', proposalPk)
      .andWhere('user_id', userId)
      .first()
      .then((review?: ReviewRecord) =>
        review ? this.createReviewObject(review) : null
      );
  }

  async removeUserForReview(id: number): Promise<Review> {
    const [reviewRecord]: ReviewRecord[] = await database
      .from('SEP_Reviews')
      .where('review_id', id)
      .returning('*')
      .del();

    return this.createReviewObject(reviewRecord);
  }

  async updateReview(args: AddReviewArgs): Promise<Review> {
    const { reviewID, comment, grade, status, sepID } = args;

    return database
      .update(
        {
          comment,
          grade,
          status,
        },
        ['*']
      )
      .from('SEP_Reviews')
      .where('review_id', reviewID)
      .then((review: ReviewRecord[]) => {
        return new Review(
          reviewID,
          review[0].proposal_pk,
          review[0].user_id,
          comment,
          grade,
          status,
          sepID
        );
      });
  }

  async getProposalReviews(id: number): Promise<Review[]> {
    return database
      .select()
      .from('SEP_Reviews')
      .where('proposal_pk', id)
      .then((reviews: ReviewRecord[]) => {
        return reviews.map((review) => this.createReviewObject(review));
      });
  }

  async addUserForReview(args: AddUserForReviewArgs): Promise<Review> {
    const { userID, proposalPk, sepID } = args;

    return database
      .insert({
        user_id: userID,
        proposal_pk: proposalPk,
        status: ReviewStatus.DRAFT,
        sep_id: sepID,
      })
      .returning('*')
      .into('SEP_Reviews')
      .then((records: ReviewRecord[]) => this.createReviewObject(records[0]));
  }

  async getUserReviews(
    sepIds: number[],
    userId?: number,
    callId?: number,
    instrumentId?: number,
    status?: ReviewStatus
  ): Promise<Review[]> {
    return database
      .select()
      .from('SEP_Reviews')
      .modify((qb) => {
        if (userId) {
          qb.where('user_id', userId);
        }

        // sometimes the ID 0 is sent as a equivalent of all
        if (callId) {
          qb.join('proposals', {
            'proposals.proposal_pk': 'SEP_Reviews.proposal_pk',
          });
          qb.where('proposals.call_id', callId);
        }

        // sometimes the ID 0 is sent as a equivalent of all
        if (instrumentId) {
          qb.join('instrument_has_proposals', {
            'instrument_has_proposals.proposal_pk': 'SEP_Reviews.proposal_pk',
          });
          qb.where('instrument_has_proposals.instrument_id', instrumentId);
        }

        if (status !== undefined && status !== null) {
          qb.where('SEP_Reviews.status', status);
        }
      })
      .whereIn('sep_id', sepIds)
      .distinctOn('SEP_Reviews.proposal_pk')
      .then((reviews: ReviewRecord[]) => {
        return reviews.map((review) => this.createReviewObject(review));
      });
  }
}
