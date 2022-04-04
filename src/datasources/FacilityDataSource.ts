import { Facility, FacilityWithAvailabilityTime } from '../models/Facility';

export interface FacilityDataSource {
  create(name: string): Promise<Facility>;
  get(id: number): Promise<Facility | null>;
  update(newFacility: Facility): Promise<Facility>;
  delete(id: number): Promise<Facility>;
  getAll(): Promise<Facility[]>;
  getByCallId(callIds: number[]): Promise<FacilityWithAvailabilityTime[]>;
  setAvailabilityTime(
    callId: number,
    facilityId: number,
    availabilityTime: number
  ): Promise<boolean>;
}
