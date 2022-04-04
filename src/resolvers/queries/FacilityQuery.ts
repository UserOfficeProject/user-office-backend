import { Query, Arg, Ctx, Resolver, Int } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Facility } from '../types/Facility';

@Resolver()
export class FacilityQuery {
  @Query(() => Facility, { nullable: true })
  facility(@Arg('id', () => Int) id: number, @Ctx() context: ResolverContext) {
    return context.queries.facility.get(context.user, id);
  }

  @Query(() => [Facility])
  facilities(@Ctx() context: ResolverContext) {
    return context.queries.facility.getAll(context.user);
  }

  @Query(() => [Facility])
  facilitiesByCall(
    @Arg('callIds', () => [Int]) callIds: number[],
    @Ctx() context: ResolverContext
  ) {
    return context.queries.facility.getByCallIds(context.user, callIds);
  }
}
