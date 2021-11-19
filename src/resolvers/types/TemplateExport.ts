import { Field, ObjectType } from 'type-graphql';

import { TemplateExport as TemplateExportOrigin } from '../../models/Template';

@ObjectType()
export class TemplateExport implements Partial<TemplateExportOrigin> {
  @Field(() => String)
  public version: string;

  @Field(() => Date)
  public exportDate: Date;

  @Field(() => String)
  public json: string;
}
