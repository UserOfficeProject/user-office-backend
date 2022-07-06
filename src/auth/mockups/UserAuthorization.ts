import 'reflect-metadata';
import { injectable } from 'tsyringe';

import { dummyUser } from '../../datasources/mockups/UserDataSource';
import { User } from '../../models/User';
import { UserAuthorization } from '../UserAuthorization';

@injectable()
export class UserAuthorizationMock extends UserAuthorization {
  async externalTokenLogin(token: string): Promise<User | null> {
    if (token === 'valid') {
      return dummyUser;
    }

    return null;
  }

  async logout(token: string): Promise<void> {
    return;
  }
  async isExternalTokenValid(externalToken: string): Promise<boolean> {
    return true;
  }
}
