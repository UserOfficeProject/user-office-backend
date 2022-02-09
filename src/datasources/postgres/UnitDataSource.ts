import { injectable } from 'tsyringe';

import { Quantity } from '../../models/Quantity';
import { Unit } from '../../models/Unit';
import { CreateUnitArgs } from '../../resolvers/mutations/CreateUnitMutation';
import { UnitDataSource } from '../UnitDataSource';
import database from './database';
import {
  createQuantityObject,
  createUnitObject,
  QuantityRecord,
  UnitRecord,
} from './records';

const EXPORT_VERSION = '1.0.0';

@injectable()
export default class PostgresUnitDataSource implements UnitDataSource {
  async createUnit(unit: CreateUnitArgs): Promise<Unit | null> {
    const [unitRecord]: UnitRecord[] = await database
      .insert({
        unit_id: unit.id,
        unit: unit.unit,
        quantity: unit.quantity,
        symbol: unit.symbol,
        si_conversion_formula: unit.siConversionFormula,
      })
      .into('units')
      .returning('*');

    if (!unitRecord) {
      throw new Error('Could not create unit');
    }

    return createUnitObject(unitRecord);
  }

  async deleteUnit(id: string): Promise<Unit> {
    const [unitRecord]: UnitRecord[] = await database('units')
      .where('units.unit_id', id)
      .del()
      .from('units')
      .returning('*');

    if (!unitRecord) {
      throw new Error(`Could not delete unit with id:${id}`);
    }

    return createUnitObject(unitRecord);
  }

  async getUnits(): Promise<Unit[]> {
    return await database
      .select()
      .from('units')
      .orderBy('unit', 'asc')
      .then((records: UnitRecord[]) =>
        records.map((unit) => createUnitObject(unit))
      );
  }

  async getQuantities(): Promise<Quantity[]> {
    return await database
      .select()
      .from('quantities')
      .orderBy('quantity_id', 'asc')
      .then((records: QuantityRecord[]) =>
        records.map((quantity) => createQuantityObject(quantity))
      );
  }

  async getUnitsAsJson(): Promise<string> {
    const EXPORT_DATE = new Date();

    const units = await this.getUnits();
    const quantities = await this.getQuantities();

    return JSON.stringify({
      version: EXPORT_VERSION,
      exportDate: EXPORT_DATE,
      units,
      quantities,
    });
  }
}
