import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { FacilityDataSource } from '../datasources/FacilityDataSource';
import { Authorized } from '../decorators';
import { Facility } from '../models/Facility';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';

@injectable()
export default class FacilityMutations {
  constructor(
    @inject(Tokens.FacilityDataSource)
    private dataSource: FacilityDataSource
  ) {}

  //@ValidateArgs(createInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async create(
    agent: UserWithRole | null,
    name: string
  ): Promise<Facility | Rejection> {
    return this.dataSource.create(name).catch((error) => {
      return rejection(
        'Could not create facility',
        { agent, shortCode: name },
        error
      );
    });
  }

  @Authorized([Roles.USER_OFFICER])
  async delete(
    agent: UserWithRole | null,
    id: number
  ): Promise<Facility | Rejection> {
    return this.dataSource.delete(id).catch((error) => {
      return rejection('Could not delete facility', { agent, id: id }, error);
    });
  }

  @Authorized([Roles.USER_OFFICER])
  async update(
    agent: UserWithRole | null,
    newFacility: Facility
  ): Promise<Facility | Rejection> {
    return this.dataSource.update(newFacility).catch((error) => {
      return rejection(
        'Could not update facility',
        { agent, facility: newFacility },
        error
      );
    });
  }

  //@ValidateArgs(setAvailabilityTimeOnInstrumentValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async setAvailabilityTime(
    agent: UserWithRole | null,
    callId: number,
    instrumentId: number,
    availabilityTime: number
  ): Promise<boolean | Rejection> {
    return this.dataSource
      .setAvailabilityTime(callId, instrumentId, availabilityTime)
      .then((result) => result)
      .catch((error) => {
        return rejection(
          'Could not set availability time on instrument',
          { agent, callId: callId, instrumentId: instrumentId },
          error
        );
      });
  }
}
