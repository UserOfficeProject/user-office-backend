import { Arg, Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { PermissionsWithAccessToken } from '../types/PermissionsWithAccessToken';

@Resolver()
export class GetAllQueryAndMutationMethodsQuery {
  @Query(() => PermissionsWithAccessToken, { nullable: true })
  accessTokenAndPermissions(
    @Arg('accessTokenKey', () => String) accessTokenKey: string,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.admin.getTokenAndPermissionsByKey(
      context.user,
      accessTokenKey
    );
  }
}
