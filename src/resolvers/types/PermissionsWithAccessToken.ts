import { ObjectType, Field, Int } from 'type-graphql';

import { Permissions } from '../../models/Permissions';

@ObjectType()
export class PermissionsWithAccessToken implements Partial<Permissions> {
  @Field()
  public name: string;

  @Field()
  public accessTokenKey: string;

  @Field()
  public accessToken: string;

  @Field()
  public accessPermissions: string;
}
