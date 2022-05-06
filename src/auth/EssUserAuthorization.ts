import jsonwebtoken from 'jsonwebtoken';
import 'reflect-metadata';
import { injectable } from 'tsyringe';

import { User } from '../models/User';
import { UserAuthorization } from './UserAuthorization';

interface ExternalLoginJWT {
  scope: string;
  client_id: string;
  ORCID: string;
  mail: string;
  FirstName: string;
  subject: string;
  'pi.sri': string;
  LastName: string;
  exp: number;
}

const SECRET =
  '55a9c59afe9580c5769da3ed8f98aebc0c40af3a50f3301825a7f57fb070865c';
const ALGORITHM = 'HS256';

@injectable()
export class EssUserAuthorization extends UserAuthorization {
  private decode(token: string) {
    return jsonwebtoken.verify(token, SECRET, {
      algorithms: [ALGORITHM],
    }) as ExternalLoginJWT;
  }

  async externalTokenLogin(token: string): Promise<User | null> {
    const decoded = this.decode(token);

    return this.userDataSource.getByOrcID(decoded.ORCID);
  }

  async logout(): Promise<void> {
    // JWT tokens can not be invalidated
    return;
  }

  async isExternalTokenValid(token: string): Promise<boolean> {
    return this.decode(token) !== null;
  }
}
