import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { RiskAssessmentDataSource } from '../datasources/RiskAssessmentDataSource';
import { Authorized } from '../decorators';
import { ProposalEndStatus } from '../models/Proposal';
import { rejection, Rejection } from '../models/Rejection';
import { TemplateCategoryId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { CreateRiskAssessmentArgs } from '../resolvers/mutations/CreateRiskAssesssment';
import { UpdateRiskAssessmentArgs } from '../resolvers/mutations/UpdateRiskAssessmentMutation';
import { QuestionaryDataSource } from './../datasources/QuestionaryDataSource';
import { RiskAssessment } from './../resolvers/types/RiskAssessment';
import { RiskAssessmentAuthorization } from './../utils/RiskAssessmentAuthorization';
import { UserAuthorization } from './../utils/UserAuthorization';

@injectable()
export default class RiskAssessmentMutations {
  constructor(
    @inject(Tokens.RiskAssessmentDataSource)
    private dataSource: RiskAssessmentDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuthorization: UserAuthorization,
    @inject(Tokens.RiskAssessmentAuthorization)
    private riskAssessmentAuth: RiskAssessmentAuthorization
  ) {}

  @Authorized()
  async createRiskAssessment(
    user: UserWithRole | null,
    args: CreateRiskAssessmentArgs
  ): Promise<RiskAssessment | Rejection> {
    const proposal = await this.proposalDataSource.get(args.proposalPk);
    if (!proposal) {
      return rejection(
        'Can not create risk assessment, proposal does not exist',
        {
          args,
          agent: user,
        }
      );
    }

    if (
      proposal.finalStatus !== ProposalEndStatus.ACCEPTED ||
      proposal.managementDecisionSubmitted === false
    ) {
      return rejection(
        'Can not create risk assessment, the proposal is not yet accepted',
        {
          args,
          agent: user,
        }
      );
    }

    const isProposalOwner = await this.userAuthorization.hasAccessRights(
      user,
      proposal
    );

    if (isProposalOwner === false) {
      return rejection(
        'Can not create riskAssessment for proposal that does not belong to you',
        { args, agent: user }
      );
    }

    try {
      const riskAssessment = await this.dataSource.createRiskAssessment(
        args,
        user!.id
      );

      const questionary = await this.questionaryDataSource.create(
        user!.id,
        TemplateCategoryId.RISK_ASSESSMENT
      );

      return this.dataSource.updateRiskAssessment({
        riskAssessmentId: riskAssessment.riskAssessmentId,
        questionaryId: questionary.questionaryId,
      });
    } catch (error) {
      return rejection(
        'Could not create riskAssessment because of an error',
        { args },
        error
      );
    }
  }

  @Authorized()
  async updateRiskAssessment(
    user: UserWithRole | null,
    args: UpdateRiskAssessmentArgs
  ): Promise<RiskAssessment | Rejection> {
    const riskAssessment = await this.dataSource.getRiskAssessment(
      args.riskAssessmentId
    );
    if (!riskAssessment) {
      return rejection(
        'Can not update risk assessment, risk assessment does not exist',
        {
          args,
          agent: user,
        }
      );
    }

    const hasRights = await this.riskAssessmentAuth.hasWriteRights(
      user,
      riskAssessment
    );

    if (hasRights === false) {
      return rejection(
        'Can not update riskAssessment because user not authorized for this action',
        { args, agent: user }
      );
    }

    try {
      return this.dataSource.updateRiskAssessment(args);
    } catch (error) {
      return rejection(
        'Could not update risk assessment because of an error',
        { args },
        error
      );
    }
  }

  @Authorized()
  async deleteRiskAssessment(
    user: UserWithRole | null,
    riskAssessmentId: number
  ): Promise<RiskAssessment | Rejection> {
    const hasRights = await this.riskAssessmentAuth.hasWriteRights(
      user,
      riskAssessmentId
    );
    if (hasRights === false) {
      return rejection(
        'Can not update risk assessment because of insufficient permissions',
        { user, visitId: riskAssessmentId }
      );
    }

    return this.dataSource.deleteRiskAssessment(riskAssessmentId);
  }
}
