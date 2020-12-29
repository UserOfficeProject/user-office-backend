import { Logger, logger } from '@esss-swap/duo-logger';

import { proposalDataSource, shipmentDataSource } from '../datasources';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { ShipmentDataSource } from '../datasources/ShipmentDataSource';
import { UserWithRole } from '../models/User';
import { userAuthorization } from './UserAuthorization';

export class ShipmentAuthorization {
  constructor(
    private shipmentDataSource: ShipmentDataSource,
    private proposalDataSource: ProposalDataSource,
    private logger: Logger
  ) {}

  async hasReadRights(agent: UserWithRole | null, shipmentId: number) {
    return this.hasAccessRights(agent, shipmentId);
  }

  async hasWriteRights(agent: UserWithRole | null, shipmentId: number) {
    return this.hasAccessRights(agent, shipmentId);
  }

  private async hasAccessRights(
    agent: UserWithRole | null,
    shipmentId: number
  ) {
    if (await userAuthorization.isUserOfficer(agent)) {
      return true;
    }

    const shipment = await this.shipmentDataSource.get(shipmentId);
    if (!shipment) {
      this.logger.logError('Could not find shipment', {
        shipmentId,
      });

      return false;
    }

    const proposal = await this.proposalDataSource.get(shipment.proposalId);

    if (!proposal) {
      this.logger.logError('Could not find proposal for shipment', {
        shipmentId,
      });

      return false;
    }

    return userAuthorization.hasAccessRights(agent, proposal);
  }
}

export const shipmentAuthorization = new ShipmentAuthorization(
  shipmentDataSource,
  proposalDataSource,
  logger
);
