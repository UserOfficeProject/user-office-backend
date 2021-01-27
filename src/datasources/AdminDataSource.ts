import { Page } from '../models/Admin';
import { Feature } from '../models/Feature';
import { Institution } from '../models/Institution';
import { Permissions } from '../models/Permissions';
import { BasicUserDetails } from '../models/User';
import { InstitutionsFilter } from './../resolvers/queries/InstitutionsQuery';

export interface AdminDataSource {
  getInstitution(id: number): Promise<Institution | null>;
  createInstitution(institution: Institution): Promise<Institution | null>;
  updateInstitution(institution: Institution): Promise<Institution | null>;
  deleteInstitution(id: number): Promise<Institution>;
  getInstitutions(filter?: InstitutionsFilter): Promise<Institution[]>;
  getInstitutionUsers(id: number): Promise<BasicUserDetails[]>;
  getCountries(): Promise<Entry[]>;
  getNationalities(): Promise<Entry[]>;
  get(id: number): Promise<string | null>;
  setPageText(id: number, text: string): Promise<Page>;
  resetDB(): Promise<string>;
  applyPatches(): Promise<string>;
  getFeatures(): Promise<Feature[]>;
  getPermissionsByToken(accessToken: string): Promise<Permissions>;
}
export class Entry {
  constructor(public id: number, public value: string) {}
}
