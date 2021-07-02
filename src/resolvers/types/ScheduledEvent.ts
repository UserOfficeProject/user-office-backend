import {
  Ctx,
  Directive,
  Field,
  FieldResolver,
  ID,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Visit } from './Visit';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class ScheduledEvent {
  @Field(() => ID)
  @Directive('@external')
  id: number;
}

@Resolver((of) => ScheduledEvent)
export class ScheduledEventResolver {
  @FieldResolver(() => Visit, { nullable: true })
  async visit(
    @Root() event: ScheduledEvent,
    @Ctx() context: ResolverContext
  ): Promise<Visit | null> {
    return context.queries.visit.getVisitByScheduledEventId(
      context.user,
      event.id
    );
  }
}
