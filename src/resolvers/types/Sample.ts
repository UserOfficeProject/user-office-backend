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
import { Sample as SampleOrigin, SampleStatus } from '../../models/Sample';
import { TemplateCategoryId } from '../../models/Template';
import { Proposal } from './Proposal';
import { Questionary } from './Questionary';
import { SampleExperimentSafetyInput } from './SampleExperimentSafetyInput';

@ObjectType()
export class Sample implements Partial<SampleOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public title: string;

  @Field(() => Int)
  public creatorId: number;

  @Field(() => Int)
  public questionaryId: number;

  @Field(() => Int)
  public proposalPk: number;

  @Field()
  public questionId: string;

  @Field(() => SampleStatus)
  public safetyStatus: SampleStatus;

  @Field()
  public safetyComment: string;

  @Field(() => Date)
  public created: Date;
}

@Resolver(() => Sample)
export class SampleResolver {
  @FieldResolver(() => Questionary)
  async questionary(
    @Root() sample: Sample,
    @Ctx() context: ResolverContext
  ): Promise<Questionary> {
    return context.queries.questionary.getQuestionaryOrDefault(
      context.user,
      sample.questionaryId,
      TemplateCategoryId.SAMPLE_DECLARATION
    );
  }

  @FieldResolver(() => Proposal)
  async proposal(
    @Root() sample: Sample,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.get(context.user, sample.proposalPk);
  }

  @FieldResolver(() => SampleExperimentSafetyInput)
  async sampleEsi(
    @Root() sample: Sample,
    @Ctx() context: ResolverContext
  ): Promise<SampleExperimentSafetyInput | null> {
    return context.queries.esi.getSampleEsi(context.user, sample.id);
  }
}
