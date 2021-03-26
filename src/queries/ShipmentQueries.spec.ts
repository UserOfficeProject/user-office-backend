import 'reflect-metadata';
import { container } from 'tsyringe';

import {
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import ShipmentQueries from './ShipmentQueries';

let shipmentQueries: ShipmentQueries;

beforeEach(() => {
  shipmentQueries = container.resolve(ShipmentQueries);
});

test('A userofficer can get samples', () => {
  return expect(
    shipmentQueries.getShipment(dummyUserOfficerWithRole, 1)
  ).resolves.not.toBe(null);
});

test('A user can get samples', () => {
  return expect(
    shipmentQueries.getShipment(dummyUserWithRole, 1)
  ).resolves.not.toBe(null);
});

test('A user not on proposal can not get samples', () => {
  return expect(
    shipmentQueries.getShipment(dummyUserNotOnProposalWithRole, 1)
  ).resolves.toBe(null);
});
