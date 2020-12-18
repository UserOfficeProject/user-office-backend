import { logger } from '@esss-swap/duo-logger';

import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { QuestionaryStep, Questionary } from '../models/Questionary';
import { UserWithRole } from '../models/User';
import { QuestionaryAuthorization } from '../utils/QuestionaryAuthorization';

export default class QuestionaryQueries {
  constructor(
    public dataSource: QuestionaryDataSource,
    private templateDataSource: TemplateDataSource,
    private authorizer: QuestionaryAuthorization
  ) {}

  @Authorized()
  async getQuestionary(
    agent: UserWithRole | null,
    questionaryId: number
  ): Promise<Questionary | null> {
    const hasRights = await this.authorizer.hasReadRights(agent, questionaryId);
    if (!hasRights) {
      logger.logWarn('Permissions violated trying to access questionary', {
        email: agent?.email,
        questionaryId,
      });

      return null;
    }

    return this.dataSource.getQuestionary(questionaryId);
  }

  @Authorized()
  async getQuestionarySteps(
    agent: UserWithRole | null,
    questionaryId: number
  ): Promise<QuestionaryStep[] | null> {
    const hasRights = await this.authorizer.hasReadRights(agent, questionaryId);
    if (!hasRights) {
      logger.logWarn('Permissions violated trying to access steps', {
        email: agent?.email,
        questionaryId,
      });

      return null;
    }

    return this.dataSource.getQuestionarySteps(questionaryId);
  }

  async getBlankQuestionarySteps(
    agent: UserWithRole | null,
    templateId: number
  ): Promise<QuestionaryStep[]> {
    return this.dataSource.getBlankQuestionarySteps(templateId);
  }
}
