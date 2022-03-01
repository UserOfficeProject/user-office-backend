import { Args, ArgsType, Ctx, Field, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { rejection } from '../../models/Rejection';
import { isSiConversionFormulaValid } from '../../utils/isSiConversionFormulaValid';
import { UnitResponseWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ArgsType()
export class CreateUnitArgs {
  @Field()
  id: string;

  @Field()
  unit: string;

  @Field()
  quantity: string;

  @Field()
  symbol: string;

  @Field()
  siConversionFormula: string;
}

@Resolver()
export class CreateUnitMutation {
  @Mutation(() => UnitResponseWrap)
  createUnit(@Args() args: CreateUnitArgs, @Ctx() context: ResolverContext) {
    if (isSiConversionFormulaValid(args.siConversionFormula) === false) {
      return rejection('The SI conversion formula is not valid', { args });
    }

    return wrapResponse(
      context.mutations.admin.createUnit(context.user, args),
      UnitResponseWrap
    );
  }
}
