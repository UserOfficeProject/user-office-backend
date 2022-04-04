/* eslint-disable @typescript-eslint/no-unused-vars */
import { Facility, FacilityWithAvailabilityTime } from '../../models/Facility';
import { FacilityDataSource } from '../FacilityDataSource';

export class FacilityDataSourceMock implements FacilityDataSource {
  private facility1 = new Facility(0, 'Test Facility 1');
  private facility2 = new Facility(1, 'Test Facility 2');
  private facilities: Facility[] = [this.facility1, this.facility2];

  async create(name: string): Promise<Facility> {
    return new Facility(2, name);
  }

  async get(id: number): Promise<Facility | null> {
    return this.facility1;
  }

  async update(newFacility: Facility): Promise<Facility> {
    return newFacility;
  }

  async delete(id: number): Promise<Facility> {
    return this.facility1;
  }

  async getAll(): Promise<Facility[]> {
    return this.facilities;
  }

  async getByCallId(
    callIds: number[]
  ): Promise<FacilityWithAvailabilityTime[]> {
    return [
      {
        availabilityTime: 100,
        ...this.facility1,
      } as FacilityWithAvailabilityTime,
    ];
  }

  async setAvailabilityTime(
    callId: number,
    facilityId: number,
    availabilityTime: number
  ): Promise<boolean> {
    return true;
  }
}
