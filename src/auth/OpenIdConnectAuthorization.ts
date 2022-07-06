import { logger } from '@user-office-software/duo-logger';
import 'reflect-metadata';

import { User } from '../models/User';
import { OpenIdClient } from './OpenIdClient';
import { UserAuthorization } from './UserAuthorization';

export abstract class OpenIdConnectAuthorization<T> extends UserAuthorization {
  public async externalTokenLogin(code: string): Promise<User | null> {
    try {
      const redirectUrl = process.env.AUTH_REDIRECT_URI; // URL that the user is redirected back to after login
      const client = await OpenIdClient.getInstance();

      /**
       * Making a request to the authorization server to exchange the code for a tokenset.
       ** tokenset will contain access_token and id_token
       */
      const params = client.callbackParams('?code=' + code);
      const tokenSet = await client.callback(redirectUrl, params);

      /**
       * Checking if the tokenset is valid and if it is, then we get the userProfile
       */
      const userProfile = await client.userinfo<T>(tokenSet);

      if (!this.isValidUserProfile(userProfile)) {
        logger.logError('Invalid user profile returned from issuer', {
          authorizer: this.constructor.name,
          userProfile,
        });
        throw new Error('Invalid user profile returned from issuer');
      }

      /**
       * If the user profile is valid, then we upsert the user and return it
       */
      const user = this.upsertUser(userProfile);

      return user;
    } catch (error) {
      logger.logError('Error while logging in with external token', {
        error: (error as Error)?.message,
      });

      throw new Error('Error while logging in with external token');
    }
  }

  public async logout(token: string): Promise<void> {
    // No need to logout
    return;
  }

  public async isExternalTokenValid(code: string): Promise<boolean> {
    // No need to check if code is valid
    return true;
  }

  abstract upsertUser(idToken: T): Promise<User | null>;
  abstract isValidUserProfile(userProfile: T): boolean;
}
