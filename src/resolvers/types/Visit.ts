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
import { Visit as VisitOrigin } from '../../models/Visit';
import { VisitStatus } from '../../models/Visit';
import { BasicUserDetails } from './BasicUserDetails';
import { Proposal } from './Proposal';
import { UserVisit } from './UserVisit';

@ObjectType()
export class Visit implements Partial<VisitOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public proposalPk: number;

  @Field(() => VisitStatus)
  public status: VisitStatus;

  @Field(() => Int)
  public creatorId: number;

  @Field(() => Int)
  public teamLeadUserId: number;
}

@Resolver(() => Visit)
export class VisitResolver {
  @FieldResolver(() => Proposal)
  async proposal(
    @Root() visit: Visit,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.get(context.user, visit.proposalPk);
  }

  @FieldResolver(() => [UserVisit])
  async userVisits(
    @Root() visit: Visit,
    @Ctx() context: ResolverContext
  ): Promise<UserVisit[] | null> {
    return context.queries.visit.getUserVisits(context.user, visit.id);
  }

  @FieldResolver(() => BasicUserDetails)
  async teamLead(
    @Root() visit: Visit,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return context.queries.user.getBasic(context.user, visit.teamLeadUserId);
  }
}
