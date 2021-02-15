import { Field, Int, ArgsType, InputType } from 'type-graphql';

import { UserRole } from '../../models/User';

@InputType()
export class AssignChairOrSecretaryToSEPInput {
  @Field(() => Int)
  userId: number;

  @Field(() => UserRole)
  roleId: UserRole;

  @Field(() => Int)
  sepId: number;
}

@ArgsType()
export class AssignChairOrSecretaryToSEPArgs {
  @Field(() => AssignChairOrSecretaryToSEPInput)
  public assignChairOrSecretaryToSEPInput: AssignChairOrSecretaryToSEPInput;
}
