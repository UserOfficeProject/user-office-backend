import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { SampleDataSource } from '../datasources/SampleDataSource';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { Sample } from './../resolvers/types/Sample';
import { ProposalAuthorization } from './ProposalAuthorization';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class SampleAuthorization {
  private userAuth = container.resolve(UserAuthorization);
  private proposalAuth = container.resolve(ProposalAuthorization);

  constructor(
    @inject(Tokens.SampleDataSource)
    private sampleDataSource: SampleDataSource
  ) {}

  private async resolveSample(
    sampleOrSampleId: Sample | number
  ): Promise<Sample | null> {
    let sample;

    if (typeof sampleOrSampleId === 'number') {
      sample = await this.sampleDataSource.getSample(sampleOrSampleId);
    } else {
      sample = sampleOrSampleId;
    }

    return sample;
  }

  async isSampleSafetyReviewer(agent: UserWithRole | null) {
    if (agent == null) {
      return false;
    }

    return agent?.currentRole?.shortCode === Roles.SAMPLE_SAFETY_REVIEWER;
  }

  async hasReadRights(
    agent: UserWithRole | null,
    sample: Sample
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    sampleId: number
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    sampleOrSampleId: Sample | number
  ): Promise<boolean> {
    return this.hasAccessRights(agent, sampleOrSampleId);
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    sample: Sample
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    sampleId: number
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    sampleOrSampleId: Sample | number
  ): Promise<boolean> {
    return this.hasAccessRights(agent, sampleOrSampleId);
  }

  private async hasAccessRights(
    agent: UserWithRole | null,
    sampleOrSampleId: Sample | number
  ) {
    // User officer has access
    if (this.userAuth.isUserOfficer(agent)) {
      return true;
    }

    const sample = await this.resolveSample(sampleOrSampleId);

    if (!sample) {
      return false;
    }

    /*
     * For the sample the authorization follows the business logic for the proposal
     * authorization that the sample is associated with
     */
    return this.proposalAuth.hasAccessRights(agent, sample.proposalPk);
  }
}
