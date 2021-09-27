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
import { ExperimentSafetyInput as ExperimentSafetyInputOrigin } from '../../models/ExperimentSafetyInput';
import { TemplateCategoryId } from '../../models/Template';
import { Questionary } from './Questionary';
import { Sample } from './Sample';

@ObjectType()
export class ExperimentSafetyInput
  implements Partial<ExperimentSafetyInputOrigin>
{
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public visitId: number;

  @Field(() => Int)
  public creatorId: number;

  @Field(() => Int)
  public questionaryId: number;

  @Field(() => Boolean)
  public isSubmitted: boolean;

  @Field(() => Date)
  public created: Date;
}

@Resolver(() => ExperimentSafetyInput)
export class ExperimentSafetyInputResolver {
  @FieldResolver(() => Questionary)
  async questionary(
    @Root() esi: ExperimentSafetyInput,
    @Ctx() context: ResolverContext
  ): Promise<Questionary> {
    return context.queries.questionary.getQuestionaryOrDefault(
      context.user,
      esi.questionaryId,
      TemplateCategoryId.PROPOSAL_QUESTIONARY
    );
  }

  @FieldResolver(() => [Sample])
  async samples(
    @Root() esi: ExperimentSafetyInput,
    @Ctx() context: ResolverContext
  ): Promise<Sample[]> {
    return context.queries.sample.getSamplesByEsiId(context.user, esi.id);
  }
}
