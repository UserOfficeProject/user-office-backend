import {
  Ctx,
  Mutation,
  Resolver,
  Arg,
  Int,
  Field,
  InputType,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { SuccessResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@InputType()
export class ChangeProposalsStatusInput {
  @Field(() => Int)
  public statusId: number;

  @Field(() => [Int])
  public proposalIds: number[];
}

@Resolver()
export class ChangeProposalsStatusMutation {
  @Mutation(() => SuccessResponseWrap)
  cloneProposal(
    @Arg('changeProposalsStatusInput')
    changeProposalsStatusInput: ChangeProposalsStatusInput,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.proposal.changeProposalsStatus(
        context.user,
        changeProposalsStatusInput
      ),
      SuccessResponseWrap
    );
  }
}
