import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { UserRole } from '../../models/User';
import { SEPResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';
import { AssignChairOrSecretaryToSEPArgs } from './AddSEPMembersRoleMutation';

@ArgsType()
export class UpdateMemberSEPArgs {
  @Field(() => Int)
  public memberId: number;

  @Field(() => Int)
  public sepId: number;

  @Field(() => UserRole)
  public roleId: UserRole;
}

@ArgsType()
export class AssignReviewersToSEPArgs {
  @Field(() => [Int])
  public memberIds: number[];

  @Field(() => Int)
  public sepId: number;
}

@ArgsType()
export class AssignSepReviewersToProposalArgs {
  @Field(() => [Int])
  public memberIds: number[];

  @Field(() => Int)
  public sepId: number;

  @Field(() => Int)
  public proposalId: number;
}

@ArgsType()
export class RemoveSepReviewerFromProposalArgs {
  @Field(() => Int)
  public memberId: number;

  @Field(() => Int)
  public sepId: number;

  @Field(() => Int)
  public proposalId: number;
}

@ArgsType()
export class AssignSEPChairAndSecretaryArgs {
  @Field(() => [Int])
  public memberIds: number[];

  @Field(() => Int)
  public sepId: number;
}

@Resolver()
export class AssignMembersToSEPMutation {
  @Mutation(() => SEPResponseWrap)
  async assignChairOrSecretary(
    @Args() args: AssignChairOrSecretaryToSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.assignChairOrSecretaryToSEP(context.user, args),
      SEPResponseWrap
    );
  }

  @Mutation(() => SEPResponseWrap)
  async assignReviewersToSEP(
    @Args() args: AssignReviewersToSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.assignReviewersToSEP(context.user, args),
      SEPResponseWrap
    );
  }

  @Mutation(() => SEPResponseWrap)
  async removeMemberFromSep(
    @Args() args: UpdateMemberSEPArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.removeMemberFromSEP(context.user, args),
      SEPResponseWrap
    );
  }

  @Mutation(() => SEPResponseWrap)
  async assignSepReviewersToProposal(
    @Args() args: AssignSepReviewersToProposalArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.assignSepReviewersToProposal(context.user, args),
      SEPResponseWrap
    );
  }

  @Mutation(() => SEPResponseWrap)
  async removeMemberFromSEPProposal(
    @Args() args: RemoveSepReviewerFromProposalArgs,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.sep.removeMemberFromSepProposal(context.user, args),
      SEPResponseWrap
    );
  }
}
