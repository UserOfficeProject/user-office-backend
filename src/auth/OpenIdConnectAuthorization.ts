import { logger } from '@user-office-software/duo-logger';
import { OpenIdClient } from '@user-office-software/openid';
import { ValidUserInfo } from '@user-office-software/openid/lib/ValidUserInfo';
import { UserinfoResponse } from 'openid-client';

import 'reflect-metadata';
import { rejection, Rejection } from '../models/Rejection';
import { AuthJwtPayload, User, UserRole } from '../models/User';
import { NonNullableField } from '../utils/helperFunctions';
import { UserAuthorization } from './UserAuthorization';

type ValidUser = NonNullableField<
  User,
  'oidcSub' | 'oidcAccessToken' | 'oidcRefreshToken'
>;

export abstract class OpenIdConnectAuthorization extends UserAuthorization {
  public async externalTokenLogin(code: string): Promise<User | null> {
    try {
      const client = await OpenIdClient.getInstance();
      const { idToken, accessToken, refreshToken } = await client.authorize(
        code
      );

      /**
       * If the user profile is valid, then we upsert the user and return it
       */
      const user = await this.upsertUser(idToken, accessToken, refreshToken);

      return user;
    } catch (error) {
      logger.logError('Error ocurred while logging in with external token', {
        error: (error as Error)?.message,
        stack: (error as Error)?.stack,
      });

      throw new Error('Error ocurred while logging in with external token');
    }
  }

  async logout(uosToken: AuthJwtPayload): Promise<void | Rejection> {
    // validate user in token
    const userFromToken = this.validateUser(uosToken.user);

    try {
      // get and validate user form datasource
      const user = this.validateUser(
        await this.userDataSource.getByOIDCSub(userFromToken.oidcSub)
      );

      const client = await OpenIdClient.getInstance();
      await client.revoke(user.oidcAccessToken);

      return;
    } catch (error) {
      return rejection('Error ocurred while logging out', {
        error: (error as Error)?.message,
      });
    }
  }

  public async isExternalTokenValid(code: string): Promise<boolean> {
    // No need to check external token validity, because we check UOS JWT token
    return true;
  }

  private async getUserInstitutionId(userInfo: UserinfoResponse) {
    if (userInfo.organisation) {
      const institutions = await this.adminDataSource.getInstitutions({
        name: userInfo.organisation as string,
      });

      if (institutions.length === 1) {
        return institutions[0].id;
      }
    }

    return undefined;
  }

  private async upsertUser(
    userInfo: ValidUserInfo,
    accessToken: string,
    refreshToken?: string
  ): Promise<User> {
    const institutionId = await this.getUserInstitutionId(userInfo);
    const user = await this.userDataSource.getByOIDCSub(userInfo.sub);
    if (user) {
      await this.userDataSource.update({
        ...user,
        firstname: userInfo.given_name,
        lastname: userInfo.family_name,
        email: userInfo.email,
        oidcAccessToken: accessToken,
        oidcRefreshToken: refreshToken ?? '',
        oidcSub: userInfo.sub,
        department: userInfo.department as string,
        gender: userInfo.gender as string,
        user_title: userInfo.title as string,
        organisation: institutionId ?? user.organisation,
      });

      return user;
    } else {
      const userWithEmailExists =
        (await this.userDataSource.getByEmail(userInfo.email)) !== null;

      if (userWithEmailExists) {
        throw new Error(`User with email ${userInfo.email} already exists`);
      }

      const newUser = await this.userDataSource.create(
        'unspecified',
        userInfo.given_name,
        undefined,
        userInfo.family_name,
        userInfo.email,
        '',
        userInfo.given_name,
        userInfo.sub,
        accessToken,
        refreshToken ?? '',
        'unspecified',
        1,
        new Date(),
        1,
        '',
        '',
        userInfo.email,
        '',
        undefined
      );

      await this.userDataSource.addUserRole({
        userID: newUser.id,
        roleID: UserRole.USER,
      });

      return newUser;
    }
  }

  private validateUser(user: User | null): ValidUser {
    if (!user?.oidcSub || !user?.oidcAccessToken) {
      logger.logError('Invalid user', {
        authorizer: this.constructor.name,
        user,
      });
      throw new Error('Invalid user');
    }

    return user as ValidUser;
  }
}
