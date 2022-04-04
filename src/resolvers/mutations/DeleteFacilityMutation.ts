import {
  Args,
  ArgsType,
  Ctx,
  Mutation,
  Resolver,
  Field,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { FacilityResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class DeleteFacilityArgs {
  @Field(() => Int)
  public id: number;
}

@Resolver()
export class DeleteFacilityMutation {
  @Mutation(() => FacilityResponseWrap)
  async deleteFacility(
    @Args() args: DeleteFacilityArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.facility.delete(context.user, args.id),
      FacilityResponseWrap
    );
  }
}
