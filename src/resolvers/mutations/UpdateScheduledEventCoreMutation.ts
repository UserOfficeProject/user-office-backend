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
import { ScheduledEventResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class UpdateScheduledEventArgs {
  @Field(() => Int)
  scheduledEventId: number;

  @Field(() => Boolean, { nullable: true })
  isShipmentDeclared?: boolean;
}

@Resolver()
export class UpdateScheduledEventCoreMutation {
  @Mutation(() => ScheduledEventResponseWrap)
  updateScheduledEventCore(
    @Args() args: UpdateScheduledEventArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.scheduledEvent.updateScheduledEvent(context.user, args),
      ScheduledEventResponseWrap
    );
  }
}
