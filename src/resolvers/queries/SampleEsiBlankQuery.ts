import { Args, ArgsType, Ctx, Field, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { SampleExperimentSafetyInput } from '../types/SampleExperimentSafetyInput';

@ArgsType()
export class SampleEsiBlankArgs {
  @Field(() => Int)
  public esiId: number;

  @Field(() => String)
  public questionId: string;
}

@Resolver()
export class SampleEsiBlankQuery {
  @Query(() => SampleExperimentSafetyInput)
  sampleEsiBlank(
    @Ctx() context: ResolverContext,
    @Args() args: SampleEsiBlankArgs
  ) {
    return context.queries.sampleEsi.getSampleEsiBlank(context.user, args);
  }
}
