import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection } from '../../models/Rejection';
import { UserRole } from '../../models/User';
import { Response } from '../Decorators';
import { ResponseWrapBase } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';
import { BasicUserDetails } from './../types/BasicUserDetails';

@InputType()
export class EmailInviteInput {
  @Field()
  public firstname: string;

  @Field()
  public lastname: string;

  @Field()
  public email: string;

  @Field(() => UserRole)
  userRole: UserRole;
}

@ObjectType()
class CreateUserByEmailInviteResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => BasicUserDetails, { nullable: true })
  public user: BasicUserDetails;
}

@Resolver()
export class CreateUserByEmailInviteMutation {
  @Mutation(() => CreateUserByEmailInviteResponseWrap)
  createUserByEmailInvite(
    @Arg('emailInvite', () => EmailInviteInput) emailInvite: EmailInviteInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user
        .createUserByEmailInvite(context.user, emailInvite)
        .then((res) => (isRejection(res) ? res : res.user)),
      CreateUserByEmailInviteResponseWrap
    );
  }
}
