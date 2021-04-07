import 'reflect-metadata';
import { container } from 'tsyringe';

import context from '../buildContext';
import {
  dummyApiAccessToken,
  dummyApiAccessTokens,
} from '../datasources/mockups/AdminDataSource';
import {
  dummyUserOfficerWithRole,
  dummyUserWithRole,
} from '../datasources/mockups/UserDataSource';
import AdminQueries from './AdminQueries';

const adminQueries = container.resolve(AdminQueries);

describe('Test Admin Queries', () => {
  test('A user can get page text', () => {
    return expect(adminQueries.getPageText(1)).resolves.toBe('HELLO WORLD');
  });

  test('A user can get features', () => {
    return expect(adminQueries.getFeatures()).resolves.toHaveLength(1);
  });

  test('A user can not get all api access tokens', () => {
    return expect(
      adminQueries.getAllTokensAndPermissions(dummyUserWithRole)
    ).resolves.toBe(null);
  });

  test('A user-officer can get all api access tokens', () => {
    return expect(
      adminQueries.getAllTokensAndPermissions(dummyUserOfficerWithRole)
    ).resolves.toBe(dummyApiAccessTokens);
  });

  test('A user-officer can get api access token by id', () => {
    return expect(
      adminQueries.getTokenAndPermissionsById(
        dummyUserOfficerWithRole,
        'kkmgdyzpj26uxubxoyl'
      )
    ).resolves.toBe(dummyApiAccessToken);
  });

  test('A user can not get all queries and mutations', () => {
    return expect(
      adminQueries.getAllQueryAndMutationMethods(dummyUserWithRole, context)
    ).resolves.toEqual(null);
  });

  test('A user-officer can not get all queries and mutations', async () => {
    const result = await adminQueries.getAllQueryAndMutationMethods(
      dummyUserOfficerWithRole,
      context
    );

    expect(result.queries.length).toBeGreaterThan(0);
    expect(result.mutations.length).toBeGreaterThan(0);

    expect(result.queries).toContain('ProposalQueries.getAll');
  });
});
