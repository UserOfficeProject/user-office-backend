import jsonwebtoken from 'jsonwebtoken';

import { ReviewDataSourceMock } from '../datasources/mockups/ReviewDataSource';
import {
  dummyPlaceHolderUser,
  dummyUser,
  dummyUserNotOnProposal,
  dummyUserOfficer,
  UserDataSourceMock,
} from '../datasources/mockups/UserDataSource';
import { BasicUserDetails, UserRole } from '../models/User';
import { isRejection } from '../rejection';
import { UserAuthorization } from '../utils/UserAuthorization';
import UserMutations from './UserMutations';

const secret = process.env.secret as string;

const goodToken = jsonwebtoken.sign(
  {
    id: dummyUser.id,
    type: 'passwordReset',
    updated: dummyUser.updated,
  },
  secret,
  { expiresIn: '24h' }
);

const badToken = jsonwebtoken.sign(
  {
    id: dummyUser.id,
    updated: dummyUser.updated,
  },
  secret,
  { expiresIn: '-24h' }
);

const userAuthorization = new UserAuthorization(
  new UserDataSourceMock(),
  new ReviewDataSourceMock()
);
const userMutations = new UserMutations(
  new UserDataSourceMock(),
  userAuthorization
);

test('A user can invite another user by email', () => {
  return expect(
    userMutations.createUserByEmailInvite(dummyUser, {
      firstname: 'firstname',
      lastname: 'lastname',
      email: 'email@google.com',
      userRole: UserRole.USER,
    })
  ).resolves.toStrictEqual({
    inviterId: dummyUser.id,
    userId: 5,
    role: UserRole.USER,
  });
});

test('A user must be logged in to invite another user by email', () => {
  return expect(
    userMutations.createUserByEmailInvite(null, {
      firstname: 'firstname',
      lastname: 'lastname',
      email: 'email@google.com',
      userRole: UserRole.USER,
    })
  ).resolves.toHaveProperty('reason', 'NOT_LOGGED');
});

test('A user cannot invite another user by email if the user already has an account', () => {
  return expect(
    userMutations.createUserByEmailInvite(dummyUserNotOnProposal, {
      firstname: 'firstname',
      lastname: 'lastname',
      email: dummyUser.email,
      userRole: UserRole.USER,
    })
  ).resolves.toHaveProperty('reason', 'ACCOUNT_EXIST');
});

test('A user can reinvite another user by email if the user has not created an account', () => {
  return expect(
    userMutations.createUserByEmailInvite(dummyUser, {
      firstname: 'firstname',
      lastname: 'lastname',
      email: dummyPlaceHolderUser.email,
      userRole: UserRole.USER,
    })
  ).resolves.toStrictEqual({
    inviterId: dummyUser.id,
    userId: dummyPlaceHolderUser.id,
    role: UserRole.USER,
  });
});

test('A user officer can invite a reviewer by email', () => {
  return expect(
    userMutations.createUserByEmailInvite(dummyUserOfficer, {
      firstname: 'firstname',
      lastname: 'lastname',
      email: dummyPlaceHolderUser.email,
      userRole: UserRole.REVIEWER,
    })
  ).resolves.toStrictEqual({
    inviterId: dummyUserOfficer.id,
    userId: dummyPlaceHolderUser.id,
    role: UserRole.REVIEWER,
  });
});

test('A user cannot invite a reviewer by email', () => {
  return expect(
    userMutations.createUserByEmailInvite(dummyUser, {
      firstname: 'firstname',
      lastname: 'lastname',
      email: 'email@google.com',
      userRole: UserRole.REVIEWER,
    })
  ).resolves.toHaveProperty('reason', 'NOT_ALLOWED');
});

test('A user can update its own name', () => {
  return expect(
    userMutations.update(dummyUser, {
      id: 2,
      firstname: 'klara',
      lastname: 'undefined',
    })
  ).resolves.toBe(dummyUser);
});

test('A user cannot update another users name', () => {
  return expect(
    userMutations.update(dummyUserNotOnProposal, {
      id: 2,
      firstname: 'klara',
      lastname: 'undefined',
    })
  ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
});

test('A not logged in user cannot update another users name', () => {
  return expect(
    userMutations.update(null, {
      id: 2,
      firstname: 'klara',
      lastname: 'undefined',
    })
  ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
});

test('A userofficer can update another users name', () => {
  return expect(
    userMutations.update(dummyUserOfficer, {
      id: 2,
      firstname: 'klara',
      lastname: 'undefined',
    })
  ).resolves.toBe(dummyUser);
});

test('A user cannot update its roles', () => {
  return expect(
    userMutations.update(dummyUser, {
      id: 2,
      firstname: 'klara',
      lastname: 'undefined',
      roles: [1, 2],
    })
  ).resolves.toHaveProperty('reason', 'INSUFFICIENT_PERMISSIONS');
});

test('A userofficer can update users roles', () => {
  return expect(
    userMutations.update(dummyUserOfficer, {
      id: 2,
      firstname: 'klara',
      lastname: 'undefined',
      roles: [1, 2],
    })
  ).resolves.toBe(dummyUser);
});

test('A user should be able to login with credentials and get a token', () => {
  return expect(
    userMutations.login(dummyUser.email, 'Test1234!').then(data => typeof data)
  ).resolves.toBe('string');
});

test('A user should not be able to login with unvalid credentials', () => {
  return expect(
    userMutations.login(dummyUser.username, 'Wrong_Password!')
  ).resolves.toHaveProperty('reason', 'WRONG_EMAIL_OR_PASSWORD');
});

test('A user should not be able to update a token if it is unvalid', () => {
  return expect(
    userMutations.token('this_is_a_invalid_token')
  ).resolves.toHaveProperty('reason', 'BAD_TOKEN');
});

test('A user should not be able to update a token if it is expired', () => {
  return expect(userMutations.token(badToken)).resolves.toHaveProperty(
    'reason',
    'BAD_TOKEN'
  );
});

test('A user should be able to update a token if valid', () => {
  return expect(
    userMutations.token(goodToken).then(data => typeof data)
  ).resolves.toBe('string');
});

test('A user can reset its password by providing a valid email', () => {
  return expect(
    userMutations.resetPasswordEmail(dummyUser.email)
  ).resolves.toHaveProperty('user');
});

test('A user gets an error if providing a email not attached to a account', () => {
  return expect(
    userMutations.resetPasswordEmail('dummyemail@ess.se')
  ).resolves.toHaveProperty('reason', 'COULD_NOT_FIND_USER_BY_EMAIL');
});

test('A user can update its password if it has a valid token', () => {
  return expect(
    userMutations.resetPassword(goodToken, 'Test1234!')
  ).resolves.toBeInstanceOf(BasicUserDetails);
});

test('A user can not update its password if it has a bad token', () => {
  return expect(
    userMutations.resetPassword(badToken, 'Test1234!')
  ).resolves.toHaveProperty('reason');
});

test('A user can update its password ', () => {
  return expect(
    userMutations.updatePassword(dummyUser, dummyUser.id, 'Test1234!')
  ).resolves.toBeInstanceOf(BasicUserDetails);
});

test('A user can not update another users password ', () => {
  return expect(
    userMutations.updatePassword(
      dummyUserNotOnProposal,
      dummyUser.id,
      'Test1234!'
    )
  ).resolves.toHaveProperty('reason', 'NOT_ALLOWED');
});

test('A not logged in users can not update passwords ', () => {
  return expect(
    userMutations.updatePassword(null, dummyUser.id, 'Test1234!')
  ).resolves.toHaveProperty('reason', 'NOT_ALLOWED');
});

test('A user officer can update any password ', () => {
  return expect(
    userMutations.updatePassword(dummyUserOfficer, dummyUser.id, 'Test1234!')
  ).resolves.toBeInstanceOf(BasicUserDetails);
});

test('A user must not be able to obtain token for another user', async () => {
  return expect(
    isRejection(
      await userMutations.getTokenForUser(dummyUser, dummyUserOfficer.id)
    )
  ).toBe(true);
});
