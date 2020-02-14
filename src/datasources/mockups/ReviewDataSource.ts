import { ReviewDataSource } from "../ReviewDataSource";
import { Review } from "../../models/Review";
import { TechnicalReview } from "../../models/TechnicalReview";

export const dummyReview = new Review(4, 10, 1, "Good proposal", 9, 0);

export const dummyReviewbad = new Review(1, 9, 1, "bad proposal", 1, 0);

export class reviewDataSource implements ReviewDataSource {
  getTechnicalReview(proposalID: number): Promise<TechnicalReview | null> {
    throw new Error("Method not implemented.");
  }
  setTechnicalReview(
    proposalID: number,
    comment: string,
    timeAllocation: number,
    status: number
  ): Promise<TechnicalReview> {
    throw new Error("Method not implemented.");
  }
  async addUserForReview(userID: number, proposalID: number): Promise<Review> {
    return new Review(1, proposalID, userID, " ", 1, 1);
  }
  async removeUserForReview(id: number): Promise<Review> {
    return new Review(1, 1, 1, " ", 1, 1);
  }
  async get(id: number): Promise<Review | null> {
    if (id == 1) {
      return dummyReviewbad;
    }
    return dummyReview;
  }
  async submitReview(
    reviewID: number,
    comment: string,
    grade: number
  ): Promise<Review> {
    return dummyReview;
  }
  async getProposalReviews(id: number): Promise<Review[]> {
    return [dummyReview];
  }
  async getUserReviews(id: number): Promise<Review[]> {
    return [dummyReview];
  }
}
