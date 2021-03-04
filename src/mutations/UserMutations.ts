import { logger } from '@esss-swap/duo-logger';
import {
  deleteUserValidationSchema,
  createUserByEmailInviteValidationSchema,
  createUserValidationSchema,
  updateUserValidationSchema,
  updateUserRolesValidationSchema,
  signInValidationSchema,
  getTokenForUserValidationSchema,
  resetPasswordByEmailValidationSchema,
  addUserRoleValidationSchema,
  updatePasswordValidationSchema,
  userPasswordFieldBEValidationSchema,
} from '@esss-swap/duo-validation';
import * as bcrypt from 'bcryptjs';

import UOWSSoapClient from '../datasources/stfc/UOWSSoapInterface';
import { UserDataSource } from '../datasources/UserDataSource';
import { EventBus, Authorized, ValidateArgs } from '../decorators';
import { Event } from '../events/event.enum';
import { EmailInviteResponse } from '../models/EmailInviteResponse';
import { Roles, Role } from '../models/Role';
import {
  User,
  BasicUserDetails,
  UserWithRole,
  EmailVerificationJwtPayload,
  AuthJwtPayload,
  PasswordResetJwtPayload,
} from '../models/User';
import { UserRole } from '../models/User';
import { UserLinkResponse } from '../models/UserLinkResponse';
import { isRejection, rejection, Rejection } from '../rejection';
import { AddUserRoleArgs } from '../resolvers/mutations/AddUserRoleMutation';
import { CreateUserByEmailInviteArgs } from '../resolvers/mutations/CreateUserByEmailInviteMutation';
import { CreateUserArgs } from '../resolvers/mutations/CreateUserMutation';
import {
  UpdateUserArgs,
  UpdateUserRolesArgs,
} from '../resolvers/mutations/UpdateUserMutation';
import { signToken, verifyToken } from '../utils/jwt';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class UserMutations {
  constructor(
    private dataSource: UserDataSource,
    private userAuth: UserAuthorization
  ) {}

  createHash(password: string): string {
    //Check that password follows rules

    //Setting fixed salt for development
    //const salt = bcrypt.genSaltSync(10);
    const salt = '$2a$10$1svMW3/FwE5G1BpE7/CPW.';
    const hash = bcrypt.hashSync(password, salt);

    return hash;
  }

  @ValidateArgs(deleteUserValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.USER_DELETED)
  async delete(
    agent: UserWithRole | null,
    { id }: { id: number }
  ): Promise<User | Rejection> {
    const user = await this.dataSource.delete(id);
    if (!user) {
      return rejection('INTERNAL_ERROR');
    }

    return user;
  }

  createEmailInviteResponse(userId: number, agentId: number, role: UserRole) {
    return new EmailInviteResponse(userId, agentId, role);
  }

  @ValidateArgs(createUserByEmailInviteValidationSchema(UserRole))
  @Authorized()
  @EventBus(Event.EMAIL_INVITE)
  async createUserByEmailInvite(
    agent: UserWithRole | null,
    args: CreateUserByEmailInviteArgs
  ): Promise<EmailInviteResponse | Rejection> {
    let userId: number | null = null;
    let role: UserRole = args.userRole;
    // Check if email exist in database and if user has been invited before
    const user = await this.dataSource.getByEmail(args.email);
    if (user && user.placeholder) {
      userId = user.id;

      return this.createEmailInviteResponse(userId, (agent as User).id, role);
    } else if (user) {
      return rejection('ACCOUNT_EXIST');
    }

    if (
      args.userRole === UserRole.SEP_REVIEWER &&
      (await this.userAuth.isUserOfficer(agent))
    ) {
      userId = await this.dataSource.createInviteUser(args);
      await this.dataSource.setUserRoles(userId, [UserRole.SEP_REVIEWER]);
      role = UserRole.SEP_REVIEWER;
    } else if (args.userRole === UserRole.USER) {
      userId = await this.dataSource.createInviteUser(args);
      await this.dataSource.setUserRoles(userId, [UserRole.USER]);
      role = UserRole.USER;
    } else if (
      args.userRole === UserRole.SEP_CHAIR &&
      (await this.userAuth.isUserOfficer(agent))
    ) {
      // NOTE: For inviting SEP_CHAIR and SEP_SECRETARY we do not setUserRoles because they are set right after in separate call.
      userId = await this.dataSource.createInviteUser(args);
      role = UserRole.SEP_CHAIR;
    } else if (
      args.userRole === UserRole.SEP_SECRETARY &&
      (await this.userAuth.isUserOfficer(agent))
    ) {
      userId = await this.dataSource.createInviteUser(args);
      role = UserRole.SEP_SECRETARY;
    } else if (
      args.userRole === UserRole.INSTRUMENT_SCIENTIST &&
      (await this.userAuth.isUserOfficer(agent))
    ) {
      userId = await this.dataSource.createInviteUser(args);
      role = UserRole.INSTRUMENT_SCIENTIST;
    }

    if (!userId) {
      return rejection('NOT_ALLOWED');
    } else {
      return this.createEmailInviteResponse(userId, (agent as User).id, role);
    }
  }

  @ValidateArgs(createUserValidationSchema)
  @EventBus(Event.USER_CREATED)
  async create(
    agent: UserWithRole | null,
    args: CreateUserArgs
  ): Promise<UserLinkResponse | Rejection> {
    if (
      this.createHash(args.orcid) !== args.orcidHash &&
      !(process.env.NODE_ENV === 'development')
    ) {
      logger.logError('ORCID hash mismatch', { args });

      return rejection('ORCID_HASH_MISMATCH');
    }

    const hash = this.createHash(args.password);
    let organisationId = args.organisation;
    // Check if user has other org and if so create it
    if (args.otherOrganisation) {
      organisationId = await this.dataSource.createOrganisation(
        args.otherOrganisation,
        false
      );
    }

    //Check if email exist in database and if user has been invited
    let user = (await this.dataSource.getByEmail(args.email)) as UserWithRole;

    if (user && user.placeholder) {
      const changePassword = await this.updatePassword(user, {
        id: user.id,
        password: args.password,
      });
      const updatedUser = (await this.update(user, {
        id: user.id,
        placeholder: false,
        ...args,
      })) as UserWithRole;

      if (isRejection(updatedUser) || !changePassword) {
        logger.logError('Could not create user', {
          updatedUser,
          changePassword,
        });

        return rejection('INTERNAL_ERROR');
      }
      user = updatedUser;
    } else if (user) {
      return rejection('ACCOUNT_EXIST');
    } else {
      try {
        user = (await this.dataSource.create(
          args.user_title,
          args.firstname,
          args.middlename,
          args.lastname,
          `${args.firstname}.${args.lastname}.${args.orcid}`, // This is just for now, while we decide on the final format
          hash,
          args.preferredname,
          args.orcid,
          args.refreshToken,
          args.gender,
          args.nationality,
          args.birthdate,
          organisationId,
          args.department,
          args.position,
          args.email,
          args.telephone,
          args.telephone_alt
        )) as UserWithRole;
      } catch (err) {
        if ('code' in err && err.code === '23505') {
          return rejection('ACCOUNT_EXIST');
        }
      }
    }

    const roles = await this.dataSource.getUserRoles(user.id);

    //If user has no role assign it the user role
    if (!roles.length) {
      this.dataSource.setUserRoles(user.id, [UserRole.USER]);
    }

    if (!user) {
      logger.logError('Could not create user', { args });

      return rejection('INTERNAL_ERROR');
    }

    const token = signToken<EmailVerificationJwtPayload>(
      {
        id: user.id,
        type: 'emailVerification',
        updated: user.updated,
      },
      { expiresIn: '24h' }
    );

    // Email verification link
    const link = process.env.baseURL + '/emailVerification/' + token;

    // NOTE: This uses UserLinkResponse class because output should be standardized for all events where we use EventBusDecorator.
    const userLinkResponse = new UserLinkResponse(user, link);

    return userLinkResponse;
  }

  @ValidateArgs(updateUserValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.USER])
  @EventBus(Event.USER_UPDATED)
  async update(
    agent: UserWithRole | null,
    args: UpdateUserArgs
  ): Promise<User | Rejection> {
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isUser(agent, args.id))
    ) {
      return rejection('INSUFFICIENT_PERMISSIONS');
    }

    let user = await this.dataSource.get(args.id); //Hacky

    if (!user) {
      return rejection('INTERNAL_ERROR');
    }

    delete args.orcid;
    delete args.refreshToken;

    user = {
      ...user,
      ...args,
    };

    return this.dataSource
      .update(user)
      .then((user) => user)
      .catch((err) => {
        logger.logException('Could not update user', err, { user });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(updateUserRolesValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  @EventBus(Event.USER_ROLE_UPDATED)
  async updateRoles(
    agent: UserWithRole | null,
    args: UpdateUserRolesArgs
  ): Promise<User | Rejection> {
    const user = await this.dataSource.get(args.id);

    if (!user) {
      return rejection('INTERNAL_ERROR');
    }

    return this.dataSource
      .setUserRoles(args.id, args.roles)
      .then(() => user)
      .catch((err) => {
        logger.logException('Could not update user', err);

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(signInValidationSchema)
  async login(
    agent: UserWithRole | null,
    args: { email: string; password: string }
  ): Promise<string | Rejection> {
    const user = await this.dataSource.getByEmail(args.email);

    if (!user) {
      return rejection('WRONG_EMAIL_OR_PASSWORD');
    }
    const roles = await this.dataSource.getUserRoles(user.id);
    const result = await this.dataSource.getPasswordByEmail(args.email);

    if (!result) {
      return rejection('WRONG_EMAIL_OR_PASSWORD');
    }

    const valid = bcrypt.compareSync(args.password, result);

    if (!valid) {
      return rejection('WRONG_EMAIL_OR_PASSWORD');
    }

    if (!user.emailVerified) {
      return rejection('EMAIL_NOT_VERIFIED');
    }

    const token = signToken<AuthJwtPayload>({
      user,
      roles,
      currentRole: roles[0],
    });

    return token;
  }

  @ValidateArgs(getTokenForUserValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async getTokenForUser(
    agent: UserWithRole | null,
    { userId }: { userId: number }
  ): Promise<string | Rejection> {
    const user = await this.dataSource.get(userId);

    if (!user) {
      return rejection('USER_DOES_NOT_EXIST');
    }

    const roles = await this.dataSource.getUserRoles(user.id);
    const token = signToken<AuthJwtPayload>({
      user,
      roles,
      currentRole: roles[0],
    });

    return token;
  }

  async token(token: string): Promise<string | Rejection> {
    try {
      const decoded = verifyToken<AuthJwtPayload>(token);
      const roles = await this.dataSource.getUserRoles(decoded.user.id);
      const freshToken = signToken<AuthJwtPayload>({
        user: decoded.user,
        roles,
        currentRole: decoded.currentRole,
      });

      return freshToken;
    } catch (error) {
      logger.logError('Bad token', { token });

      return rejection('BAD_TOKEN');
    }
  }

  async checkExternalToken(externalToken: string): Promise<string | Rejection> {
    try {
      const client = new UOWSSoapClient();

      const rawStfcUser = await client.getPersonDetailsFromSessionId(
        externalToken
      );
      if (!rawStfcUser) {
        logger.logInfo('User not found for token', { externalToken });

        return rejection('USER_DOES_NOT_EXIST');
      }
      const stfcUser = rawStfcUser.return;

      // Create dummy user if one does not exist in the proposals DB.
      // This is needed to satisfy the FOREIGN_KEY constraints
      // in tables that link to a user (such as proposals)
      const userNumber = parseInt(stfcUser.userNumber);
      let dummyUser = await this.dataSource.get(userNumber);
      if (!dummyUser) {
        dummyUser = await this.dataSource.createDummyUser(userNumber);
      }

      const roles = await this.dataSource.getUserRoles(dummyUser.id);

      const proposalsToken = signToken<AuthJwtPayload>({
        user: dummyUser,
        roles,
        currentRole: roles[0], // User role
      });

      return proposalsToken;
    } catch (error) {
      logger.logError('Error occured during external authentication', {
        error,
      });

      return rejection('INTERNAL_ERROR');
    }
  }

  async selectRole(
    token: string,
    selectedRoleId: number
  ): Promise<string | Rejection> {
    try {
      const decoded = verifyToken<AuthJwtPayload>(token);

      // TODO: fixme
      const currentRole = decoded.roles.find(
        (role: Role) => role.id === selectedRoleId
      )!;

      const tokenWithRole = signToken<AuthJwtPayload>({
        user: decoded.user,
        roles: decoded.roles,
        currentRole,
      });

      return tokenWithRole;
    } catch (error) {
      logger.logError('Bad token', { token });

      return rejection('BAD_TOKEN');
    }
  }

  @ValidateArgs(resetPasswordByEmailValidationSchema)
  @EventBus(Event.USER_PASSWORD_RESET_EMAIL)
  async resetPasswordEmail(
    agent: UserWithRole | null,
    args: { email: string }
  ): Promise<UserLinkResponse | Rejection> {
    const user = await this.dataSource.getByEmail(args.email);

    if (!user) {
      logger.logInfo('Could not find user by email', { email: args });

      return rejection('COULD_NOT_FIND_USER_BY_EMAIL');
    }

    const token = signToken<PasswordResetJwtPayload>(
      {
        id: user.id,
        type: 'passwordReset',
        updated: user.updated,
      },
      { expiresIn: '24h' }
    );

    const link = process.env.baseURL + '/resetPassword/' + token;

    const userLinkResponse = new UserLinkResponse(user, link);

    // Send reset email with link
    return userLinkResponse;
  }

  async emailVerification(token: string) {
    // Check that token is valid
    try {
      const decoded = verifyToken<EmailVerificationJwtPayload>(token);
      const user = await this.dataSource.get(decoded.id);
      //Check that user exist and that it has not been updated since token creation
      if (
        user &&
        user.updated === decoded.updated &&
        decoded.type === 'emailVerification'
      ) {
        await this.dataSource.setUserEmailVerified(user.id);

        return true;
      } else {
        return rejection('COULD_NOT_VERIFY_USER');
      }
    } catch (error) {
      logger.logException('Could not verify email', error, { token });

      return rejection('COULD_NOT_VERIFY_USER');
    }
  }

  @ValidateArgs(addUserRoleValidationSchema)
  @Authorized([Roles.USER_OFFICER])
  async addUserRole(agent: UserWithRole | null, args: AddUserRoleArgs) {
    return this.dataSource
      .addUserRole(args)
      .then(() => true)
      .catch((err) => {
        logger.logException('Could not add user role', err, { agent });

        return rejection('INTERNAL_ERROR');
      });
  }

  @ValidateArgs(updatePasswordValidationSchema)
  @Authorized([Roles.USER_OFFICER, Roles.USER])
  async updatePassword(
    agent: UserWithRole | null,
    { id, password }: { id: number; password: string }
  ): Promise<BasicUserDetails | Rejection> {
    if (
      !(await this.userAuth.isUserOfficer(agent)) &&
      !(await this.userAuth.isUser(agent, id))
    ) {
      return rejection('INSUFFICIENT_PERMISSIONS');
    }

    try {
      const hash = this.createHash(password);
      const user = await this.dataSource.get(id);
      if (user) {
        return this.dataSource.setUserPassword(user.id, hash);
      } else {
        logger.logError('Could not update password. Used does not exist', {
          agent,
          id,
        });

        return rejection('USER_DOES_NOT_EXIST');
      }
    } catch (error) {
      logger.logException('Could not update password', error, { agent, id });

      return rejection('INTERNAL_ERROR');
    }
  }

  @ValidateArgs(userPasswordFieldBEValidationSchema)
  async resetPassword(
    agent: UserWithRole | null,
    { token, password }: { token: string; password: string }
  ): Promise<BasicUserDetails | Rejection> {
    // Check that token is valid
    try {
      const hash = this.createHash(password);
      const decoded = verifyToken<PasswordResetJwtPayload>(token);
      const user = await this.dataSource.get(decoded.id);

      //Check that user exist and that it has not been updated since token creation
      if (
        user &&
        user.updated === decoded.updated &&
        decoded.type === 'passwordReset'
      ) {
        return this.dataSource
          .setUserPassword(user.id, hash)
          .then((user) => user)
          .catch((err) => {
            logger.logError('Could not reset password', { err });

            return rejection('INTERNAL_ERROR');
          });
      }
      logger.logError('Could not reset password incomplete data', {
        user,
        decoded,
      });

      return rejection('INTERNAL_ERROR');
    } catch (error) {
      logger.logError('Could not reset password', { error, token });

      return rejection('INTERNAL_ERROR');
    }
  }

  @Authorized([Roles.USER_OFFICER])
  setUserEmailVerified(
    _: UserWithRole | null,
    id: number
  ): Promise<User | null> {
    return this.dataSource.setUserEmailVerified(id);
  }

  @Authorized([Roles.USER_OFFICER])
  setUserNotPlaceholder(
    _: UserWithRole | null,
    id: number
  ): Promise<User | null> {
    return this.dataSource.setUserNotPlaceholder(id);
  }
}
