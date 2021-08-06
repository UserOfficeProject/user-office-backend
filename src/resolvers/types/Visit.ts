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
import { Shipment } from './Shipment';
import { VisitRegistration } from './VisitRegistration';

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
  @FieldResolver(() => Proposal, { nullable: true })
  async proposal(
    @Root() visit: Visit,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.get(context.user, visit.proposalPk);
  }

  @FieldResolver(() => [VisitRegistration], { nullable: true })
  async registrations(
    @Root() visit: Visit,
    @Ctx() context: ResolverContext
  ): Promise<VisitRegistration[] | null> {
    return context.queries.visit.getRegistrations(context.user, {
      visitId: visit.id,
    });
  }

  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async teamLead(
    @Root() visit: Visit,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return context.queries.user.getBasic(context.user, visit.teamLeadUserId);
  }

  @FieldResolver(() => [Shipment], { nullable: true })
  async shipments(
    @Root() visit: Visit,
    @Ctx() context: ResolverContext
  ): Promise<Shipment[] | null> {
    return context.queries.shipment.getShipments(context.user, {
      filter: { visitId: visit.id },
    });
  }
}
