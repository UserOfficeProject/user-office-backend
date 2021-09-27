import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalEsiDataSource } from '../datasources/ProposalEsiDataSource';
import { Authorized } from '../decorators';
import { ExperimentSafetyInput } from '../models/ExperimentSafetyInput';
import { UserWithRole } from '../models/User';

export interface GetProposalEsisFilter {
  visitId?: number;
  questionaryId?: number;
}

@injectable()
export default class ProposalEsiQueries {
  constructor(
    @inject(Tokens.ProposalEsiDataSource)
    public dataSource: ProposalEsiDataSource
  ) {}

  @Authorized()
  async getEsi(
    user: UserWithRole | null,
    id: number
  ): Promise<ExperimentSafetyInput | null> {
    // TODO implement authorizer
    return this.dataSource.getEsi(id);
  }

  @Authorized()
  async getEsis(
    user: UserWithRole | null,
    filter: GetProposalEsisFilter
  ): Promise<ExperimentSafetyInput[] | null> {
    // TODO implement authorizer
    return this.dataSource.getEsis(filter);
  }
}
