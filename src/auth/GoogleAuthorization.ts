import { User, UserRole } from '../models/User';
import { OpenIdConnectAuthorization } from './OpenIdConnectAuthorization';

interface GoogleIdentityToken {
  email: string;
  email_verified: boolean;
  family_name: string;
  given_name: string;
  locale: string;
  name: string;
  picture: string;
  sub: string;
}

/**
 * Google Authorization class
 * This is an example of how to implement an authorization class
 */
export class GoogleAuthorization extends OpenIdConnectAuthorization<GoogleIdentityToken> {
  isValidUserProfile(userProfile: GoogleIdentityToken): boolean {
    return (
      userProfile.email !== undefined &&
      userProfile.family_name !== undefined &&
      userProfile.given_name !== undefined
    );
  }

  async upsertUser(idToken: GoogleIdentityToken): Promise<User | null> {
    const user = await this.userDataSource.getByEmail(idToken.email);
    if (user) {
      await this.userDataSource.update({
        ...user,
        firstname: idToken.given_name,
        lastname: idToken.family_name,
        email: idToken.email,
      });

      return user;
    } else {
      const newUser = await this.userDataSource.create(
        'unspecified',
        idToken.given_name,
        undefined,
        idToken.given_name,
        idToken.email,
        idToken.family_name,
        undefined,
        '',
        '',
        'male',
        1,
        new Date(),
        1,
        '',
        '',
        idToken.email,
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
}
