import jsonwebtoken from 'jsonwebtoken';
import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { SEPDataSource } from '../datasources/SEPDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { User, UserRole } from '../models/User';
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
  constructor(
    @inject(Tokens.UserDataSource) protected userDataSource: UserDataSource,
    @inject(Tokens.SEPDataSource) protected sepDataSource: SEPDataSource,
    @inject(Tokens.ProposalDataSource)
    protected proposalDataSource: ProposalDataSource,
    @inject(Tokens.VisitDataSource) protected visitDataSource: VisitDataSource
  ) {
    super(userDataSource, sepDataSource, proposalDataSource, visitDataSource);
  }

  private decode(token: string) {
    return jsonwebtoken.verify(token, SECRET, {
      algorithms: [ALGORITHM],
    }) as ExternalLoginJWT;
  }

  async externalTokenLogin(token: string): Promise<User | null> {
    const decoded = this.decode(token);

    const user = await this.userDataSource.getByOrcID(decoded.ORCID);
    if (user) {
      return user;
    } else {
      const newUser = await this.userDataSource.create(
        'unspecified',
        decoded.FirstName,
        undefined,
        decoded.LastName,
        decoded.mail,
        decoded.FirstName,
        undefined,
        decoded.ORCID,
        '',
        'male',
        1,
        new Date(),
        1,
        '',
        '',
        decoded.mail,
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

  async logout(): Promise<void> {
    // JWT tokens can not be invalidated
    return;
  }

  async isExternalTokenValid(token: string): Promise<boolean> {
    return this.decode(token) !== null;
  }
}
