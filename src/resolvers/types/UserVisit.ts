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
import { Questionary } from './Questionary';

@ObjectType()
export class UserVisit implements Partial<UserVisitOrigin> {
  @Field(() => Int)
  public userId: number;

  @Field(() => Int)
  public visitId: number;

  @Field(() => Int, { nullable: true })
  public registrationQuestionaryId: number | null;

  @Field(() => Boolean)
  public isRegistrationSubmitted: boolean;

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

  @FieldResolver(() => Questionary, { nullable: true })
  async questionary(
    @Root() userVisit: UserVisit,
    @Ctx() context: ResolverContext
  ): Promise<Questionary | null> {
    if (!userVisit.registrationQuestionaryId) {
      return null;
    }

    return context.queries.questionary.getQuestionary(
      context.user,
      userVisit.registrationQuestionaryId
    );
  }
}
