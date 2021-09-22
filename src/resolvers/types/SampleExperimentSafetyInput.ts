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
import { SampleExperimentSafetyInput as SampleExperimentSafetyInputOrigin } from '../../models/SampleExperimentSafetyInput';
import { TemplateCategoryId } from '../../models/Template';
import { Questionary } from './Questionary';

@ObjectType()
export class SampleExperimentSafetyInput
  implements Partial<SampleExperimentSafetyInputOrigin>
{
  @Field(() => Int)
  public esiId: number;

  @Field(() => Int)
  public sampleId: number;

  @Field(() => Int)
  public questionaryId: number;

  @Field(() => Boolean)
  public isSubmitted: boolean;
}

@Resolver(() => SampleExperimentSafetyInput)
export class SampleExperimentSafetyInputResolver {
  @FieldResolver(() => Questionary)
  async questionary(
    @Root() sampleEsi: SampleExperimentSafetyInput,
    @Ctx() context: ResolverContext
  ): Promise<Questionary> {
    return context.queries.questionary.getQuestionaryOrDefault(
      context.user,
      sampleEsi.questionaryId,
      TemplateCategoryId.SAMPLE_ESI
    );
  }
}
