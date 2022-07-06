import { User, UserRole } from '../models/User';
import { OpenIdConnectAuthorization } from './OpenIdConnectAuthorization';

interface PingIdentityToken {
  FirstName: string;
  LastName: string;
  Email: string;
  ORCID: string;
  Company: string;
  sub: string;
}

export class PingAuthorization extends OpenIdConnectAuthorization<PingIdentityToken> {
  isValidUserProfile(userProfile: PingIdentityToken): boolean {
    return (
      userProfile.FirstName !== undefined &&
      userProfile.LastName !== undefined &&
      userProfile.Email !== undefined &&
      userProfile.ORCID !== undefined &&
      userProfile.Company !== undefined
    );
  }
  async upsertUser(idToken: PingIdentityToken): Promise<User | null> {
    const user = await this.userDataSource.getByOrcID(idToken.ORCID);
    if (user) {
      await this.userDataSource.update({
        ...user,
        firstname: idToken.FirstName,
        lastname: idToken.LastName,
        email: idToken.Email,
      });

      return user;
    } else {
      const newUser = await this.userDataSource.create(
        'unspecified',
        idToken.FirstName,
        undefined,
        idToken.LastName,
        idToken.Email,
        idToken.FirstName,
        undefined,
        idToken.ORCID,
        '',
        'male',
        1,
        new Date(),
        1,
        '',
        '',
        idToken.Email,
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
