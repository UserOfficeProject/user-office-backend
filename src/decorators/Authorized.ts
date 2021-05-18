import { container } from 'tsyringe';

import { Rejection, rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { UserAuthorization } from '../utils/UserAuthorization';

const Authorized = (roles: Roles[] = []) => {
  return (
    target: any,
    name: string,
    descriptor: {
      value?: (
        agent: UserWithRole | null,
        ...args: any[]
      ) => Promise<Rejection | any>;
    }
  ) => {
    const originalMethod = descriptor.value;
    const userAuthorization = container.resolve(UserAuthorization);

    descriptor.value = async function (...args) {
      const [agent] = args;
      const isMutation = target.constructor.name.includes('Mutation');

      if (agent?.isApiAccessToken) {
        if (agent?.accessPermissions?.[`${target.constructor.name}.${name}`]) {
          return await originalMethod?.apply(this, args);
        } else {
          return isMutation ? rejection('INSUFFICIENT_PERMISSIONS') : null;
        }
      }

      if (!agent) {
        return isMutation ? rejection('NOT_LOGGED_IN') : null;
      }

      if (roles.length === 0) {
        return await originalMethod?.apply(this, args);
      }

      const hasAccessRights =
        (await userAuthorization.hasRole(
          agent,
          agent.currentRole?.shortCode as string
        )) && roles.some((role) => role === agent.currentRole?.shortCode);

      if (hasAccessRights) {
        return await originalMethod?.apply(this, args);
      } else {
        return isMutation ? rejection('INSUFFICIENT_PERMISSIONS') : null;
      }
    };
  };
};

export default Authorized;
