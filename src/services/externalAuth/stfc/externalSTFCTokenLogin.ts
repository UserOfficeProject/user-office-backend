import { container } from 'tsyringe';

import { UserAuthorization } from '../../../auth/UserAuthorization';
import { Tokens } from '../../../config/Tokens';
import { UserDataSource } from '../../../datasources/UserDataSource';
import { rejection } from '../../../models/Rejection';
import { AuthJwtPayload } from '../../../models/User';
import { signToken } from '../../../utils/jwt';

export default async function externalSTFCTokenLogin(externalToken: string) {
  const userAuth = container.resolve<UserAuthorization>(
    Tokens.UserAuthorization
  );
  const dataSource = container.resolve<UserDataSource>(Tokens.UserDataSource);

  const dummyUser = await userAuth.externalTokenLogin(externalToken);

  if (!dummyUser) {
    return rejection('User not found', { externalToken });
  }

  const roles = await dataSource.getUserRoles(dummyUser.id);

  const proposalsToken = signToken<AuthJwtPayload>({
    user: dummyUser,
    roles,
    currentRole: roles[0], // User role
    externalToken: externalToken,
  });

  return proposalsToken;
}
