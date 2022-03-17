import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { isRejection, rejection } from '../../models/Rejection';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';
import { SuccessResponseWrap } from '../types/CommonWrappers';
import { TechnicalReview } from '../types/TechnicalReview';
import { wrapResponse } from '../wrapResponse';

@InputType()
export class SubmitTechnicalReviewInput implements Partial<TechnicalReview> {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => String, { nullable: true })
  public comment: string;

  @Field(() => String, { nullable: true })
  public publicComment: string;

  @Field(() => Int, { nullable: true })
  public timeAllocation: number;

  @Field(() => TechnicalReviewStatus, { nullable: true })
  public status: TechnicalReviewStatus;

  @Field(() => Boolean)
  public submitted: boolean;

  @Field(() => Int)
  public reviewerId: number;
}

@InputType()
export class SubmitTechnicalReviewsInput {
  @Field(() => [SubmitTechnicalReviewInput])
  public technicalReviews: SubmitTechnicalReviewInput[];
}

@Resolver()
export class SubmitTechnicalReviewMutation {
  @Mutation(() => SuccessResponseWrap)
  async submitTechnicalReviews(
    @Arg('submitTechnicalReviewsInput')
    submitTechnicalReviewsInput: SubmitTechnicalReviewsInput,
    @Ctx() context: ResolverContext
  ) {
    const results = await Promise.all(
      submitTechnicalReviewsInput.technicalReviews.map(
        (submitTechnicalReviewInput) => {
          return context.mutations.review.setTechnicalReview(
            context.user,
            submitTechnicalReviewInput
          );
        }
      )
    );

    return wrapResponse(
      results.some((result) => isRejection(result))
        ? Promise.resolve(rejection('REJECTED'))
        : Promise.resolve(true),
      SuccessResponseWrap
    );
  }
}
