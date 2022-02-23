import {
  Args,
  Ctx,
  Field,
  Query,
  Resolver,
  ArgsType,
  Int,
  InputType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { TzLessDateTime } from '../CustomScalars';
import { ScheduledEventCore } from '../types/ScheduledEvent';

@InputType()
export class ScheduledEventsCoreFilter {
  @Field(() => TzLessDateTime, { nullable: true })
  endsBefore?: Date;

  @Field(() => TzLessDateTime, { nullable: true })
  endsAfter?: Date;

  @Field(() => Int, { nullable: true })
  callId?: number;

  @Field(() => Int, { nullable: true })
  instrumentId?: number;
}

@ArgsType()
export class ScheduledEventsCoreArgs {
  @Field(() => ScheduledEventsCoreFilter, { nullable: true })
  filter?: ScheduledEventsCoreFilter;

  @Field(() => Int, { nullable: true })
  first?: number;

  @Field(() => Int, { nullable: true })
  offset?: number;
}

@Resolver()
export class ScheduledEventsCoreQuery {
  @Query(() => [ScheduledEventCore])
  async scheduledEventsCore(
    @Args() args: ScheduledEventsCoreArgs,
    @Ctx() context: ResolverContext
  ): Promise<ScheduledEventCore[]> {
    return context.queries.scheduledEvent.getScheduledEventsCore(
      context.user,
      args
    );
  }
}
