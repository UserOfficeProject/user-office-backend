import context from '../buildContext';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { InstitutionsFilter } from './../resolvers/queries/InstitutionsQuery';

export default class AdminQueries {
  constructor(private dataSource: AdminDataSource) {}

  async getPageText(id: number): Promise<string | null> {
    return await this.dataSource.get(id);
  }

  async getNationalities() {
    return await this.dataSource.getNationalities();
  }
  async getCountries() {
    return await this.dataSource.getCountries();
  }
  async getInstitutions(filter?: InstitutionsFilter) {
    return await this.dataSource.getInstitutions(filter);
  }

  async getInstitution(id: number) {
    return await this.dataSource.getInstitution(id);
  }

  async getFeatures() {
    return await this.dataSource.getFeatures();
  }

  async getPermissionsByToken(accessToken: string) {
    return await this.dataSource.getTokenAndPermissionsById(accessToken);
  }

  @Authorized([Roles.USER_OFFICER])
  async getTokenAndPermissionsById(
    agent: UserWithRole | null,
    accessTokenId: string
  ) {
    return await this.dataSource.getTokenAndPermissionsById(accessTokenId);
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllTokensAndPermissions(agent: UserWithRole | null) {
    return await this.dataSource.getAllTokensAndPermissions();
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllQueryMethods(agent: UserWithRole | null) {
    const allQueryMethods: string[] = [];
    const allMutationMethods: string[] = [];

    for (const queryKey in context.queries) {
      if (Object.prototype.hasOwnProperty.call(context.queries, queryKey)) {
        //@ts-expect-error
        const element = context.queries[queryKey];

        const proto = Object.getPrototypeOf(element);
        const names = Object.getOwnPropertyNames(proto).filter(item =>
          item.startsWith('get')
        );

        const classNamesWithMethod = names.map(
          item => `${proto.constructor.name}.${item}`
        );

        allQueryMethods.push(...classNamesWithMethod);
      }
    }

    for (const mutationKey in context.mutations) {
      if (
        Object.prototype.hasOwnProperty.call(context.mutations, mutationKey)
      ) {
        //@ts-expect-error
        const element = context.mutations[mutationKey];

        const proto = Object.getPrototypeOf(element);
        const names = Object.getOwnPropertyNames(proto).filter(
          item => item !== 'constructor'
        );

        const classNamesWithMethod = names.map(
          item => `${proto.constructor.name}.${item}`
        );

        allMutationMethods.push(...classNamesWithMethod);
      }
    }

    return { queries: allQueryMethods, mutations: allMutationMethods };
  }
}
