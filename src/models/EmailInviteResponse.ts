import { BasicUserDetails } from './../resolvers/types/BasicUserDetails';
import { UserRole } from './User';

export class EmailInviteResponse {
  constructor(
    public user: BasicUserDetails,
    public inviterId: number,
    public role: UserRole
  ) {}
}
