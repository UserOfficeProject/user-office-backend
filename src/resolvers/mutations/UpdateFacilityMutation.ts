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
import {
  FacilityResponseWrap,
  SuccessResponseWrap,
} from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateFacilityArgs {
  @Field(() => Int)
  id: number;

  @Field(() => String)
  name: string;
}

@ArgsType()
export class SetFacilityAvailabilityTimeArgs {
  @Field(() => Int)
  facilityId: number;

  @Field(() => Int)
  callId: number;

  @Field(() => Int)
  availabilityTime: number;
}

@Resolver()
export class UpdateFacilityMutation {
  @Mutation(() => FacilityResponseWrap)
  async updateFacility(
    @Args() args: UpdateFacilityArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.facility.update(context.user, args),
      FacilityResponseWrap
    );
  }

  @Mutation(() => SuccessResponseWrap)
  async setFacilityAvailabilityTime(
    @Args() args: SetFacilityAvailabilityTimeArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.facility.setAvailabilityTime(
        context.user,
        args.callId,
        args.facilityId,
        args.availabilityTime
      ),
      SuccessResponseWrap
    );
  }
}
