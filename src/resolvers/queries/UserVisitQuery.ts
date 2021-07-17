import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { UserVisit } from '../types/UserVisit';

@Resolver()
export class UserVisitQuery {
  @Query(() => UserVisit, { nullable: true })
  userVisit(
    @Ctx() context: ResolverContext,
    @Arg('visitId', () => Int) visitId: number
  ) {
    return context.queries.visit.getUserVisit(context.user, visitId);
  }
}
