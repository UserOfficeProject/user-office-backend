import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ReviewDataSource } from '../datasources/ReviewDataSource';
import { UserWithRole } from '../models/User';
import { TechnicalReview } from '../resolvers/types/TechnicalReview';
import { ProposalAuthorization } from './ProposalAuthorization';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class TechnicalReviewAuthorization {
  private proposalAuth = container.resolve(ProposalAuthorization);
  private userAuth = container.resolve(UserAuthorization);
  constructor(
    @inject(Tokens.ReviewDataSource)
    private reviewDataSource: ReviewDataSource
  ) {}

  private async resolveTechnicalReview(
    technicalreviewOrProposalPk: TechnicalReview | number
  ): Promise<TechnicalReview | null> {
    let technicalreview;

    if (typeof technicalreviewOrProposalPk === 'number') {
      const proposalPk = technicalreviewOrProposalPk;
      technicalreview = await this.reviewDataSource.getTechnicalReview(
        proposalPk
      );
    } else {
      technicalreview = technicalreviewOrProposalPk;
    }

    return technicalreview;
  }

  async hasReadRights(
    agent: UserWithRole | null,
    technicalreview: TechnicalReview
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    technicalreviewId: number
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    technicalreviewOrTechnicalReviewId: TechnicalReview | number
  ): Promise<boolean> {
    if (this.userAuth.isUserOfficer(agent)) {
      return true;
    }

    const technicalreview = await this.resolveTechnicalReview(
      technicalreviewOrTechnicalReviewId
    );
    if (!technicalreview) {
      return false;
    }

    const isScientistToProposal = await this.proposalAuth.isScientistToProposal(
      agent,
      technicalreview.proposalPk
    );
    if (isScientistToProposal) {
      return true;
    }

    const isChairOrSecretaryOfProposal =
      await this.proposalAuth.isChairOrSecretaryOfProposal(
        agent,
        technicalreview.proposalPk
      );
    if (isChairOrSecretaryOfProposal) {
      return true;
    }

    const isReviewerOfProposal = await this.proposalAuth.isReviewerOfProposal(
      agent,
      technicalreview.proposalPk
    );
    if (isReviewerOfProposal) {
      return true;
    }

    return false;
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    technicalreview: TechnicalReview
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    technicalreviewId: number
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    technicalreviewOrTechnicalReviewId: TechnicalReview | number
  ): Promise<boolean> {
    if (this.userAuth.isUserOfficer(agent)) {
      return true;
    }

    const technicalreview = await this.resolveTechnicalReview(
      technicalreviewOrTechnicalReviewId
    );
    if (!technicalreview) {
      return false;
    }

    const isScientistToProposal = await this.proposalAuth.isScientistToProposal(
      agent,
      technicalreview.proposalPk
    );
    if (isScientistToProposal) {
      return true;
    }

    const isChairOrSecretaryOfProposal =
      await this.proposalAuth.isChairOrSecretaryOfProposal(
        agent,
        technicalreview.proposalPk
      );
    if (isChairOrSecretaryOfProposal) {
      return true;
    }

    const isReviewerOfProposal = await this.proposalAuth.isReviewerOfProposal(
      agent,
      technicalreview.proposalPk
    );
    if (isReviewerOfProposal && technicalreview.submitted === false) {
      return true;
    }

    return false;
  }
}
