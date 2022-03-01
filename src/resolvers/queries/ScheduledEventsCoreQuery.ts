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
class TimeSpan {
  @Field(() => TzLessDateTime, { nullable: true })
  from?: Date;

  @Field(() => TzLessDateTime, { nullable: true })
  to?: Date;
}
@InputType()
export class ScheduledEventsCoreFilter {
  @Field(() => TzLessDateTime, { nullable: true })
  endsBefore?: Date;

  @Field(() => TzLessDateTime, { nullable: true })
  endsAfter?: Date;

  @Field(() => TzLessDateTime, { nullable: true })
  startsBefore?: Date;

  @Field(() => TzLessDateTime, { nullable: true })
  startsAfter?: Date;

  @Field(() => Int, { nullable: true })
  callId?: number;

  @Field(() => Int, { nullable: true })
  instrumentId?: number;

  @Field(() => TimeSpan, { nullable: true })
  overlaps?: TimeSpan;
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
