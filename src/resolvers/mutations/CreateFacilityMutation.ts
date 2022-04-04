import { Args, ArgsType, Ctx, Mutation, Resolver, Field } from 'type-graphql';

import { ResolverContext } from '../../context';
import { FacilityResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateFacilityArgs {
  @Field(() => String)
  public name: string;
}

@Resolver()
export class CreateFacilityMutation {
  @Mutation(() => FacilityResponseWrap)
  async createFacility(
    @Args() args: CreateFacilityArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.facility.create(context.user, args.name),
      FacilityResponseWrap
    );
  }
}
