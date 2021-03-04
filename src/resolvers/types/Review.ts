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
import { Review as ReviewOrigin, ReviewStatus } from '../../models/Review';
import { Proposal } from '../types/Proposal';
import { BasicUserDetails } from './BasicUserDetails';
import { ProposalStatus } from './ProposalStatus';

@ObjectType()
export class Review implements Partial<ReviewOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => Int)
  public userID: number;

  @Field({ nullable: true })
  public comment?: string;

  @Field(() => Int, { nullable: true })
  public grade?: number;

  @Field(() => ReviewStatus)
  public status: ReviewStatus;

  public proposalID: number;

  @Field(() => Int)
  public sepID: number;
}

@ObjectType()
export class ReviewWithNextProposalStatus extends Review {
  @Field(() => ProposalStatus, { nullable: true })
  public nextProposalStatus: ProposalStatus;
}

@Resolver(() => Review)
export class ReviewResolver {
  @FieldResolver(() => BasicUserDetails, { nullable: true })
  async reviewer(
    @Root() review: Review,
    @Ctx() context: ResolverContext
  ): Promise<BasicUserDetails | null> {
    return context.queries.user.getBasic(context.user, review.userID);
  }

  @FieldResolver(() => Proposal, { nullable: true })
  async proposal(
    @Root() review: Review,
    @Ctx() context: ResolverContext
  ): Promise<Proposal | null> {
    return context.queries.proposal.get(context.user, review.proposalID);
  }
}
