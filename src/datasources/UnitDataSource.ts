import { Quantity } from '../models/Quantity';
import { Unit, UnitsImportWithValidation } from '../models/Unit';
import { CreateUnitArgs } from '../resolvers/mutations/CreateUnitMutation';
import { ImportUnitsArgs } from '../resolvers/mutations/ImportUnitsMutation';

export interface UnitDataSource {
  createUnit(unit: CreateUnitArgs): Promise<Unit | null>;
  deleteUnit(id: string): Promise<Unit>;
  getUnits(): Promise<Unit[]>;
  getQuantities(): Promise<Quantity[]>;
  getUnitsAsJson(): Promise<string>;
  validateUnitsImport(unitsAsJson: string): Promise<UnitsImportWithValidation>;
  importUnits(args: ImportUnitsArgs): Unit[] | PromiseLike<Unit[]>;
}
