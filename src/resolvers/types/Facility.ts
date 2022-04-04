import { ObjectType, Field, Int, Directive } from 'type-graphql';

import { Facility as FacilityOrigin } from '../../models/Facility';
@ObjectType()
@Directive('@key(fields: "id")')
export class Facility implements Partial<FacilityOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public name: string;

  //@Field()
  //public shortCode: string;

  //@Field()
  //public description: string;
}

@ObjectType()
export class FacilityWithAvailabilityTime extends Facility {
  @Field(() => Int, { nullable: true })
  public availabilityTime: number;
}
