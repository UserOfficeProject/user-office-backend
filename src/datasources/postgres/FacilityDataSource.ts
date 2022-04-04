import { Facility, FacilityWithAvailabilityTime } from '../../models/Facility';
import { FacilityDataSource } from '../FacilityDataSource';
import database from './database';

export default class PostgresFacilityDataSource implements FacilityDataSource {
  async create(name: string): Promise<Facility> {
    return database('facility')
      .insert({ name: name }, '*')
      .then((result) => new Facility(result[0].id, result[0].name));
  }

  async get(id: number): Promise<Facility | null> {
    return database('facility')
      .select()
      .where({ id: id })
      .first()
      .then((result) => (result ? new Facility(result.id, result.name) : null));
  }

  async update(newFacility: Facility): Promise<Facility> {
    return database('facility')
      .update({ id: newFacility.id, name: newFacility.name }, '*')
      .where({ id: newFacility.id })
      .then((result) => {
        const updatedFacility = result[0];
        if (!updatedFacility) {
          throw Error(`No facility found with id: ${newFacility.id}`);
        }

        return new Facility(updatedFacility.id, updatedFacility.name);
      });
  }

  async delete(id: number): Promise<Facility> {
    return database('facility')
      .where({ id: id })
      .del()
      .returning('*')
      .then((result) => {
        const deletedFacility = result[0];
        if (!deletedFacility) {
          throw Error(`No facility found with id: ${id}`);
        }

        return new Facility(deletedFacility.id, deletedFacility.name);
      });
  }

  async getAll(): Promise<Facility[]> {
    return database('facility')
      .orderBy('id', 'desc')
      .then((facilities) =>
        facilities.map((facility) => new Facility(facility.id, facility.name))
      );
  }

  async getByCallId(
    callIds: number[]
  ): Promise<FacilityWithAvailabilityTime[]> {
    return database('facility')
      .select(['facility.*', 'call_has_facilities.availability_time'])
      .join('call_has_facilities', {
        'facility.id': 'call_has_facilities.facility_id',
      })
      .whereIn('call_has_facilities.call_id', callIds)
      .distinct('facility.id')
      .then((facilities) =>
        facilities.map(
          (facility) =>
            new FacilityWithAvailabilityTime(
              facility.id,
              facility.name,
              facility.availability_time
            )
        )
      );
  }

  async setAvailabilityTime(
    callId: number,
    facilityId: number,
    availabilityTime: number
  ): Promise<boolean> {
    return database('call_has_facilities')
      .insert({
        facility_id: facilityId,
        call_id: callId,
        availability_time: availabilityTime,
      })
      .onConflict(['facility_id', 'call_id'])
      .merge()
      .then((result) => result && result.length > 0);
  }
}
