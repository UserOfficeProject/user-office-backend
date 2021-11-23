import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { ProposalView } from '../types/ProposalView';
import { ProposalsFilter } from './ProposalsQuery';

@ArgsType()
class ProposalsViewArgs {
  @Field(() => ProposalsFilter, { nullable: true })
  public filter?: ProposalsFilter;

  @Field(() => Int, { nullable: true })
  public first?: number;

  @Field(() => Int, { nullable: true })
  public offset?: number;
}

@ObjectType()
class ProposalsViewQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [ProposalView])
  public proposalViews: ProposalView[];
}

@Resolver()
export class ProposalsViewQuery {
  @Query(() => ProposalsViewQueryResult, { nullable: true })
  async proposalsView(
    @Args() args: ProposalsViewArgs,
    @Ctx() context: ResolverContext
  ): Promise<ProposalsViewQueryResult> {
    return context.queries.proposal.getAllView(
      context.user,
      args.filter,
      args.first,
      args.offset
    );
  }
}
