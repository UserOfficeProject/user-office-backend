export class Permissions {
  constructor(
    public accessTokenKey: string,
    public name: string,
    public accessToken: string,
    public accessPermissions: any | null
  ) {}
}
