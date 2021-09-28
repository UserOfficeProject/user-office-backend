import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { SampleEsiDataSource } from '../datasources/SampleEsiDataSource';
import { Authorized } from '../decorators';
import { Questionary } from '../models/Questionary';
import { SampleExperimentSafetyInput } from '../models/SampleExperimentSafetyInput';
import { UserWithRole } from '../models/User';
import { SampleEsiBlankArgs } from '../resolvers/queries/SampleEsiBlankQuery';
import { SampleEsiArgs } from '../resolvers/queries/SampleEsiQuery';
import { SampleDeclarationConfig } from '../resolvers/types/FieldConfig';
import { QuestionaryDataSource } from './../datasources/QuestionaryDataSource';
import { SampleDataSource } from './../datasources/SampleDataSource';
import { TemplateDataSource } from './../datasources/TemplateDataSource';

export interface GetSampleEsisFilter {
  visitId?: number;
  sampleId?: number;
}

@injectable()
export default class ProposalEsiQueries {
  constructor(
    @inject(Tokens.SampleEsiDataSource)
    public dataSource: SampleEsiDataSource,

    @inject(Tokens.SampleDataSource)
    public sampleDataSource: SampleDataSource,

    @inject(Tokens.QuestionaryDataSource)
    public questionaryDataSource: QuestionaryDataSource,

    @inject(Tokens.TemplateDataSource)
    public templateDataSource: TemplateDataSource
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
  ): Promise<SampleExperimentSafetyInput[] | null> {
    // TODO implement authorizer
    return this.dataSource.getSampleEsis(filter);
  }

  @Authorized()
  async getSampleEsiBlank(
    user: UserWithRole | null,
    args: SampleEsiBlankArgs
  ): Promise<SampleExperimentSafetyInput> {
    // TODO implement authorizer
    return new SampleExperimentSafetyInput(args.esiId, args.sampleId, 0, false);
  }

  @Authorized()
  async getQuestionaryOrDefault(
    user: UserWithRole | null,
    esi: SampleExperimentSafetyInput
  ) {
    const questionary = await this.questionaryDataSource.getQuestionary(
      esi.questionaryId
    );
    if (questionary) {
      return questionary;
    }
    const sample = await this.sampleDataSource.getSample(esi.sampleId);
    const question = await this.templateDataSource.getQuestion(
      sample!.questionId
    );
    const questionConfig = question!.config as SampleDeclarationConfig;

    return new Questionary(
      0,
      questionConfig.esiTemplateId!,
      user!.id,
      new Date()
    );
  }
}
