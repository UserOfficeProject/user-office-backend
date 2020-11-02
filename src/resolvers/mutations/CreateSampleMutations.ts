import {
  Ctx,
  Mutation,
  Resolver,
  Field,
  Int,
  Arg,
  InputType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { SampleResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@InputType()
export class CreateSampleInput {
  @Field(() => String)
  title: string;

  @Field(() => Int)
  templateId: number;

  @Field(() => Int)
  proposalId: number;
}

@Resolver()
export class CreateSampleMutation {
  @Mutation(() => SampleResponseWrap)
  createSample(
    @Arg('input', () => CreateSampleInput) input: CreateSampleInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sample.createSample(context.user, input),
      SampleResponseWrap
    );
  }
}
