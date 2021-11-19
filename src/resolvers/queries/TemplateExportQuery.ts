import { Arg, Ctx, Int, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { TemplateExport } from '../types/TemplateExport';

@Resolver()
export class TemplateExportQuery {
  @Query(() => TemplateExport, { nullable: true })
  templateExport(
    @Ctx() context: ResolverContext,
    @Arg('templateId', () => Int) templateId: number
  ) {
    return context.queries.template.getTemplateExport(context.user, templateId);
  }
}
