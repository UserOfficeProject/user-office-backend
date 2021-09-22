import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { SampleEsiDataSource } from '../datasources/SampleEsiDataSource';
import { Authorized } from '../decorators';
import { SampleExperimentSafetyInput } from '../models/SampleExperimentSafetyInput';
import { UserWithRole } from '../models/User';

export interface GetSampleEsisFilter {
  visitId?: number;
  sampleId?: number;
}

@injectable()
export default class ProposalEsiQueries {
  constructor(
    @inject(Tokens.SampleEsiDataSource)
    public dataSource: SampleEsiDataSource
  ) {}

  @Authorized()
  async getSampleEsi(
    user: UserWithRole | null,
    sampleEsiId: number
  ): Promise<SampleExperimentSafetyInput | null> {
    // TODO implement authorizer
    return this.dataSource.getSampleEsi(sampleEsiId);
  }

  @Authorized()
  async getSampleEsis(
    user: UserWithRole | null,
    filter: GetSampleEsisFilter
  ): Promise<SampleExperimentSafetyInput[] | null> {
    // TODO implement authorizer
    return this.dataSource.getSampleEsis(filter);
  }
}
