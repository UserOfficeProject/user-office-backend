import 'reflect-metadata';
import { container } from 'tsyringe';

import {
  dummyUserNotOnProposalWithRole,
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import SampleQueries from './SampleQueries';

let sampleQueries: SampleQueries;

beforeEach(() => {
  sampleQueries = container.resolve(SampleQueries);
});

test('A userofficer can get samples', () => {
  return expect(
    sampleQueries.getSamples(dummyUserOfficerWithRole, {})
  ).resolves.not.toBe(null);
});

test('A userofficer can get samples by shipment id', () => {
  return expect(
    sampleQueries.getSamplesByShipmentId(dummyUserOfficerWithRole, 1)
  ).resolves.not.toBe(null);
});

test('A user of proposal can get samples by shipment id', () => {
  return expect(
    sampleQueries.getSamplesByShipmentId(dummyUserWithRole, 1)
  ).resolves.not.toBe(null);
});

test('A user not on proposal can not get samples by shipment id', () => {
  return expect(
    sampleQueries.getSamplesByShipmentId(dummyUserNotOnProposalWithRole, 1)
  ).resolves.toBe(null);
});
