import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { BasicResolverContext } from '../context';
import { AdminDataSource } from '../datasources/AdminDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { UnitDataSource } from './../datasources/UnitDataSource';
import { InstitutionsFilter } from './../resolvers/queries/InstitutionsQuery';

@injectable()
export default class AdminQueries {
  constructor(
    @inject(Tokens.AdminDataSource) private adminDataSource: AdminDataSource,
    @inject(Tokens.UnitDataSource) private unitDataSource: UnitDataSource
  ) {}

  async getPageText(id: number): Promise<string | null> {
    return await this.adminDataSource.get(id);
  }

  async getNationalities() {
    return await this.adminDataSource.getNationalities();
  }

  async getUnits() {
    return await this.unitDataSource.getUnits();
  }

  async getQuantities() {
    return await this.unitDataSource.getQuantities();
  }

  async getCountries() {
    return await this.adminDataSource.getCountries();
  }
  async getInstitutions(filter?: InstitutionsFilter) {
    return await this.adminDataSource.getInstitutions(filter);
  }

  async getInstitution(id: number) {
    return await this.adminDataSource.getInstitution(id);
  }

  async getFeatures() {
    return await this.adminDataSource.getFeatures();
  }

  async getSettings() {
    return await this.adminDataSource.getSettings();
  }

  async getPermissionsByToken(accessToken: string) {
    return await this.adminDataSource.getTokenAndPermissionsById(accessToken);
  }

  @Authorized([Roles.USER_OFFICER])
  async getTokenAndPermissionsById(
    agent: UserWithRole | null,
    accessTokenId: string
  ) {
    return await this.adminDataSource.getTokenAndPermissionsById(accessTokenId);
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllTokensAndPermissions(agent: UserWithRole | null) {
    return await this.adminDataSource.getAllTokensAndPermissions();
  }

  @Authorized([Roles.USER_OFFICER])
  async getAllQueryAndMutationMethods(
    agent: UserWithRole | null,
    context: BasicResolverContext
  ) {
    const allQueryMethods: string[] = [];
    const allMutationMethods: string[] = [];

    Object.keys(context.queries).forEach((queryKey) => {
      const element =
        context.queries[queryKey as keyof BasicResolverContext['queries']];

      const proto = Object.getPrototypeOf(element);
      const names = Object.getOwnPropertyNames(proto).filter((item) =>
        item.startsWith('get')
      );

      const classNamesWithMethod = names.map(
        (item) => `${proto.constructor.name}.${item}`
      );

      allQueryMethods.push(...classNamesWithMethod);
    });

    Object.keys(context.mutations).forEach((mutationKey) => {
      const element =
        context.mutations[
          mutationKey as keyof BasicResolverContext['mutations']
        ];

      const proto = Object.getPrototypeOf(element);
      const names = Object.getOwnPropertyNames(proto).filter(
        (item) => item !== 'constructor'
      );

      const classNamesWithMethod = names.map(
        (item) => `${proto.constructor.name}.${item}`
      );

      allMutationMethods.push(...classNamesWithMethod);
    });

    return { queries: allQueryMethods, mutations: allMutationMethods };
  }
}
