import { logger } from '@user-office-software/duo-logger';
import { BaseClient, Issuer } from 'openid-client';
import 'reflect-metadata';

import { User } from '../models/User';
import { UserAuthorization } from './UserAuthorization';

class Client {
  private static instance: BaseClient;

  private static async createClient() {
    const discoveryUrl = process.env.AUTH_DISCOVERY_URL;
    const clientId = process.env.AUTH_CLIENT_ID;
    const clientSecret = process.env.AUTH_CLIENT_SECRET;
    const redirectUrl = process.env.AUTH_REDIRECT_URI;

    if (!discoveryUrl || !clientId || !clientSecret || !redirectUrl) {
      logger.logError('One or more ENV variables not defined', {
        discoveryUrl,
        clientId,
        clientSecret: clientSecret ? '******' : undefined,
        redirectUrl,
      });
      throw new Error('One or more ENV variables not defined');
    }

    const OpenIDIssuer = await Issuer.discover(discoveryUrl);

    return new OpenIDIssuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: [redirectUrl],
      response_types: ['code'],
    });
  }

  static async getInstance() {
    if (!this.instance) {
      this.instance = await this.createClient();
    }

    return this.instance;
  }
}

export abstract class OpenIdConnectAuthorization<T> extends UserAuthorization {
  public async externalTokenLogin(code: string): Promise<User | null> {
    try {
      const redirectUrl = process.env.AUTH_REDIRECT_URI; // URL that the user is redirected back to after login
      const client = await Client.getInstance();

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

      /**
       * If the user profile is valid, then we upsert the user and return it
       */
      const user = this.upsertUser(userProfile);

      return user;
    } catch (error) {
      logger.logError('Error while logging in with external token', { error });

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
}
