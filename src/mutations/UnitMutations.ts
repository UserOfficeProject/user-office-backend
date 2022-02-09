import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { UnitDataSource } from '../datasources/UnitDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { CreateUnitArgs } from '../resolvers/mutations/CreateUnitMutation';

@injectable()
export default class UnitMutations {
  constructor(
    @inject(Tokens.UnitDataSource) private unitDataSource: UnitDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER])
  async createUnit(agent: UserWithRole | null, args: CreateUnitArgs) {
    return await this.unitDataSource.createUnit(args);
  }

  @Authorized([Roles.USER_OFFICER])
  async deleteUnit(agent: UserWithRole | null, id: string) {
    return await this.unitDataSource.deleteUnit(id);
  }
}
