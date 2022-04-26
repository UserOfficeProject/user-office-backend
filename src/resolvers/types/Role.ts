import 'reflect-metadata';
import { Field, ObjectType, Int } from 'type-graphql';

@ObjectType()
export class Role {
  @Field((type) => Int)
  public id: number;

  @Field()
  public shortCode: string;

  @Field()
  public title: string;

  @Field()
  public facility: string;

  constructor(initObj: {
    id: number;
    shortCode: string;
    title: string;
    facility: string;
  }) {
    Object.assign(this, initObj);
  }
}
