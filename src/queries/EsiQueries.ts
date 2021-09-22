import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { Authorized } from '../decorators';
import { ExperimentSafetyInput } from '../models/ExperimentSafetyInput';
import { SampleExperimentSafetyInput } from '../models/SampleExperimentSafetyInput';
import { UserWithRole } from '../models/User';
import { EsiDataSource } from './../datasources/EsiDataSource';

export interface GetEsisFilter {
  visitId?: number;
}

export interface GetSampleEsisFilter {
  visitId?: number;
  sampleId?: number;
}

@injectable()
export default class EsiQueries {
  constructor(
    @inject(Tokens.EsiDataSource)
    public dataSource: EsiDataSource
  ) {}

  /* Proposal */
  @Authorized()
  async getEsi(
    user: UserWithRole | null,
    id: number
  ): Promise<ExperimentSafetyInput | null> {
    // TODO implement authorizer
    return this.dataSource.getEsi(id);
  }

  @Authorized()
  async getEsis(
    user: UserWithRole | null,
    filter: GetEsisFilter
  ): Promise<ExperimentSafetyInput[] | null> {
    // TODO implement authorizer
    return this.dataSource.getEsis(filter);
  }

  /* Sample */
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
