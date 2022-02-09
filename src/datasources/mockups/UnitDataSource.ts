import { Quantity } from '../../models/Quantity';
import { Unit } from '../../models/Unit';
import { CreateUnitArgs } from '../../resolvers/mutations/CreateUnitMutation';
import { UnitDataSource } from '../UnitDataSource';
export const dummyUnit = new Unit('minute', 'Minute', 'time', 'm', 'x/60');

export class UnitDataSourceMock implements UnitDataSource {
  async createUnit(unit: CreateUnitArgs): Promise<Unit | null> {
    return dummyUnit;
  }
  async deleteUnit(id: string): Promise<Unit> {
    return dummyUnit;
  }
  async getUnits(): Promise<Unit[]> {
    return [dummyUnit];
  }

  async getQuantities(): Promise<Quantity[]> {
    return [];
  }
}
