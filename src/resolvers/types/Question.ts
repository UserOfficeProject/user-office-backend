import {
  Ctx,
  Field,
  FieldResolver,
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
import { Template } from './Template';

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
// TODO implement this
// @Resolver((of) => Question)
// export class QuestionaryResolver {
//   @FieldResolver(() => [Template])
//   async steps(
//     @Root() question: Question,
//     @Ctx() context: ResolverContext
//   ): Promise<Template[]> {
//     return context.queries.questionary.getQuestionarySteps(
//       context.user,
//       questionary.questionaryId
//     );
//   }
// }
