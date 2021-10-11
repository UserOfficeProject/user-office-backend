import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalEsiDataSource } from '../datasources/ProposalEsiDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { UserWithRole } from '../models/User';
import { ExperimentSafetyInput } from './../resolvers/types/ExperimentSafetyInput';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class EsiAuthorization {
  constructor(
    @inject(Tokens.VisitDataSource) private visitDataSource: VisitDataSource,
    @inject(Tokens.ProposalEsiDataSource)
    private esiDataSource: ProposalEsiDataSource,
    @inject(Tokens.UserAuthorization)
    private userAuth: UserAuthorization
  ) {}

  private async resolveEsi(
    esiOrEsiId: ExperimentSafetyInput | number
  ): Promise<ExperimentSafetyInput | null> {
    let esi;

    if (typeof esiOrEsiId === 'number') {
      esi = await this.esiDataSource.getEsi(esiOrEsiId);
    } else {
      esi = esiOrEsiId;
    }

    return esi;
  }
  async hasAccessRights(
    agent: UserWithRole | null,
    esi: ExperimentSafetyInput
  ): Promise<boolean>;
  async hasAccessRights(
    agent: UserWithRole | null,
    esiId: number
  ): Promise<boolean>;
  async hasAccessRights(
    agent: UserWithRole | null,
    esiOrEsiId: ExperimentSafetyInput | number
  ): Promise<boolean> {
    if (!agent) {
      return false;
    }

    const esi = await this.resolveEsi(esiOrEsiId);
    if (!esi) {
      return false;
    }
    const visit = await this.visitDataSource.getVisit(esi.visitId);

    if (!visit) {
      return false;
    }

    if (
      esi.isSubmitted === true &&
      this.userAuth.isUserOfficer(agent) === false
    ) {
      return false;
    }

    return this.userAuth.hasAccessRights(agent, visit.proposalPk);
  }
}