import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { Authorized } from '../decorators';
import { Questionary, QuestionaryStep } from '../models/Questionary';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { logger } from '../utils/Logger';
import { QuestionaryAuthorization } from '../utils/QuestionaryAuthorization';

export default class QuestionaryQueries {
  constructor(
    private dataSource: QuestionaryDataSource,
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

  @Authorized([Roles.USER_OFFICER])
  getCount(user: UserWithRole | null, templateId: number): Promise<number> {
    return this.dataSource.getCount(templateId);
  }

  async getBlankQuestionarySteps(
    agent: UserWithRole | null,
    templateId: number
  ): Promise<QuestionaryStep[]> {
    return this.dataSource.getBlankQuestionarySteps(templateId);
  }
}
