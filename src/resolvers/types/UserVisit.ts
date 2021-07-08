import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { UserVisit as UserVisitOrigin } from '../../models/UserVisit';
import { BasicUserDetails } from './BasicUserDetails';

@ObjectType()
export class UserVisit implements Partial<UserVisitOrigin> {
  @Field(() => Int)
  public userId: number;

  @Field(() => Int)
  public visitId: number;

  @Field(() => Int, { nullable: true })
  public registrationQuestionaryId: number | null;

  @Field(() => Date, { nullable: true })
  public trainingExpiryDate: Date | null;
}

@Resolver((of) => UserVisit)
export class UserVisitResolver {
  @FieldResolver(() => BasicUserDetails)
  async user(
    @Root() userVisit: UserVisit,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return context.queries.user.getBasic(context.user, userVisit.userId);
  }
}
