import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { VisitResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateVisitArgs {
  @Field(() => Int)
  proposalPK: number;

  @Field(() => [Int], { nullable: true })
  team?: number[];
}

@Resolver()
export class CreateVisitMutation {
  @Mutation(() => VisitResponseWrap)
  createVisit(@Args() args: CreateVisitArgs, @Ctx() context: ResolverContext) {
    return wrapResponse(
      context.mutations.visit.createVisit(context.user, args),
      VisitResponseWrap
    );
  }
}
