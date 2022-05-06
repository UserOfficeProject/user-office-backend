import { container } from 'tsyringe';

import { UserAuthorization } from '../../../auth/UserAuthorization';
import { Tokens } from '../../../config/Tokens';
import { UserDataSource } from '../../../datasources/UserDataSource';
import { rejection } from '../../../models/Rejection';
import { AuthJwtPayload } from '../../../models/User';
import { signToken } from '../../../utils/jwt';
import { LoginWithExternalToken } from '../loginWithExternalToken';

async function externalPINGTokenLogin(externalToken: string) {
  const auth = container.resolve<UserAuthorization>(Tokens.UserAuthorization);
  const dataSource = container.resolve<UserDataSource>(Tokens.UserDataSource);

  const user = await auth.externalTokenLogin(externalToken);

  if (!user) {
    return rejection('User not found', { externalToken });
  }

  const roles = await dataSource.getUserRoles(user.id);

  const proposalsToken = signToken<AuthJwtPayload>({
    user: user,
    roles,
    currentRole: roles[0],
    externalToken: externalToken,
  });

  return proposalsToken;
}

export default externalPINGTokenLogin as LoginWithExternalToken;
