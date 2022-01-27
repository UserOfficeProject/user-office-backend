import { Field, Int, ObjectType } from 'type-graphql';

import { SiUnit as SiUnitOrigin } from '../../models/SiUnit';

@ObjectType()
export class SiUnit implements Partial<SiUnitOrigin> {
  @Field(() => Int)
  id: number;

  @Field()
  quantity: string;

  @Field()
  name: string;

  @Field()
  symbol: string;
}
