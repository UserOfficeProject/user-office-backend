import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { FacilityDataSource } from '../datasources/FacilityDataSource';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';

@injectable()
export default class FacilityQueries {
  constructor(
    @inject(Tokens.FacilityDataSource)
    public dataSource: FacilityDataSource
  ) {}

  @Authorized()
  async get(agent: UserWithRole | null, facilityId: number) {
    return await this.dataSource.get(facilityId);
  }

  @Authorized()
  async getAll(agent: UserWithRole | null) {
    return await this.dataSource.getAll();
  }

  @Authorized()
  async getByCallIds(agent: UserWithRole | null, callIds: number[]) {
    return await this.dataSource.getByCallId(callIds);
  }
}
