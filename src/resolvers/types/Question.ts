import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import {
  DataType,
  Question as QuestionOrigin,
  TemplateCategoryId,
} from '../../models/Template';
import { FieldConfigType } from './FieldConfig';

@ObjectType()
export class Question implements Partial<QuestionOrigin> {
  @Field()
  public id: string;

  @Field(() => TemplateCategoryId)
  public categoryId: TemplateCategoryId;

  @Field()
  public naturalKey: string;

  @Field(() => DataType)
  public dataType: DataType;

  @Field()
  public question: string;

  @Field(() => FieldConfigType)
  public config: typeof FieldConfigType;
}

@Resolver((of) => Question)
export class QuestionaryResolver {
  @FieldResolver(() => Int)
  async answerCount(
    @Root() question: Question,
    @Ctx() context: ResolverContext
  ): Promise<number> {
    return context.queries.questionary.dataSource.getAnswerCount(question.id);
  }

  @FieldResolver(() => Int)
  async templateCount(
    @Root() question: Question,
    @Ctx() context: ResolverContext
  ): Promise<number> {
    return context.queries.questionary.dataSource.getTemplateCount(question.id);
  }
}
