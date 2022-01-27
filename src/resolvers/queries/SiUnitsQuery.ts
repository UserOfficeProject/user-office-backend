import { Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { SiUnit } from '../types/SiUnit';

@Resolver()
export class SiUnitsQuery {
  @Query(() => [SiUnit])
  siUnits(@Ctx() context: ResolverContext) {
    return context.queries.admin.getSiUnits();
  }
}
