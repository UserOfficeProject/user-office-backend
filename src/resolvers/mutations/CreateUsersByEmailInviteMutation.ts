import { Arg, Ctx, Field, Mutation, ObjectType, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Response } from '../Decorators';
import { BasicUserDetails } from '../types/BasicUserDetails';
import { ResponseWrapBase } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';
import { EmailInviteInput } from './CreateUserByEmailInviteMutation';

@ObjectType()
class CreateUsersByEmailInviteResponseWrap extends ResponseWrapBase {
  @Response()
  @Field(() => [BasicUserDetails], { nullable: true })
  public users: BasicUserDetails[];
}

@Resolver()
export class CreateUsersByEmailInviteMutation {
  @Mutation(() => CreateUsersByEmailInviteResponseWrap)
  createUsersByEmailInvite(
    @Arg('emailInvites', () => [EmailInviteInput]) invites: EmailInviteInput[],
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.createUsersByEmailInvite(context.user, invites),
      CreateUsersByEmailInviteResponseWrap
    );
  }
}
