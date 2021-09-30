import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { SampleEsiDataSource } from '../datasources/SampleEsiDataSource';
import { Authorized } from '../decorators';
import { SampleExperimentSafetyInput } from '../models/SampleExperimentSafetyInput';
import { UserWithRole } from '../models/User';
import { SampleEsiBlankArgs } from '../resolvers/queries/SampleEsiBlankQuery';
import { SampleEsiArgs } from '../resolvers/queries/SampleEsiQuery';
import { QuestionaryDataSource } from './../datasources/QuestionaryDataSource';
import { SampleDataSource } from './../datasources/SampleDataSource';
import { TemplateDataSource } from './../datasources/TemplateDataSource';

export interface GetSampleEsisFilter {
  esiId?: number;
  sampleId?: number;
}

@injectable()
export default class SampleEsiQueries {
  constructor(
    @inject(Tokens.SampleEsiDataSource)
    public dataSource: SampleEsiDataSource,

    @inject(Tokens.SampleDataSource)
    public sampleDs: SampleDataSource,

    @inject(Tokens.QuestionaryDataSource)
    public questionaryDs: QuestionaryDataSource,

    @inject(Tokens.TemplateDataSource)
    public templateDs: TemplateDataSource
  ) {}

  @Authorized()
  async getSampleEsi(
    user: UserWithRole | null,
    args: SampleEsiArgs
  ): Promise<SampleExperimentSafetyInput | null> {
    // TODO implement authorizer
    return this.dataSource.getSampleEsi(args);
  }

  @Authorized()
  async getSampleEsis(
    user: UserWithRole | null,
    filter: GetSampleEsisFilter
  ): Promise<SampleExperimentSafetyInput[]> {
    // TODO implement authorizer
    return this.dataSource.getSampleEsis(filter);
  }

  @Authorized()
  async getSampleEsiBlank(
    user: UserWithRole | null,
    args: SampleEsiBlankArgs
  ): Promise<SampleExperimentSafetyInput> {
    // TODO implement authorizer
    return new SampleExperimentSafetyInput(args.esiId, 0, 0, false);
  }
}
