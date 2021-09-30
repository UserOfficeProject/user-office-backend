import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { CallDataSource } from '../datasources/CallDataSource';
import { ProposalEsiDataSource } from '../datasources/ProposalEsiDataSource';
import { Authorized } from '../decorators';
import { ExperimentSafetyInput } from '../models/ExperimentSafetyInput';
import { Questionary } from '../models/Questionary';
import { UserWithRole } from '../models/User';
import { ProposalDataSource } from './../datasources/ProposalDataSource';
import { QuestionaryDataSource } from './../datasources/QuestionaryDataSource';
import { VisitDataSource } from './../datasources/VisitDataSource';

export interface GetProposalEsisFilter {
  visitId?: number;
  questionaryId?: number;
}

@injectable()
export default class ProposalEsiQueries {
  constructor(
    @inject(Tokens.ProposalEsiDataSource)
    public dataSource: ProposalEsiDataSource,

    @inject(Tokens.QuestionaryDataSource)
    public questionaryDataSource: QuestionaryDataSource,

    @inject(Tokens.CallDataSource)
    public callDataSource: CallDataSource,

    @inject(Tokens.ProposalDataSource)
    public proposalDataSource: ProposalDataSource,

    @inject(Tokens.VisitDataSource)
    public visitDataSource: VisitDataSource
  ) {}

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
    filter: GetProposalEsisFilter
  ): Promise<ExperimentSafetyInput[] | null> {
    // TODO implement authorizer
    return this.dataSource.getEsis(filter);
  }

  @Authorized()
  async getQuestionaryOrDefault(
    user: UserWithRole | null,
    esi: ExperimentSafetyInput
  ): Promise<Questionary> {
    // TODO implement authorizer
    const questionary = await this.questionaryDataSource.getQuestionary(
      esi.questionaryId
    );
    if (questionary) return questionary;

    const visit = await this.visitDataSource.getVisit(esi.visitId);
    if (!visit) {
      return this.questionaryDataSource.getBlankQuestionary();
    }

    const proposal = await this.proposalDataSource.get(visit.proposalPk);
    if (!proposal) {
      return this.questionaryDataSource.getBlankQuestionary();
    }

    const call = await this.callDataSource.getCall(proposal.callId);
    if (!call) {
      return this.questionaryDataSource.getBlankQuestionary();
    }

    if (!call.esiTemplateId) {
      return this.questionaryDataSource.getBlankQuestionary();
    }

    return new Questionary(0, call.esiTemplateId, user!.id, new Date());
  }
}
