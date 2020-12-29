import { shipmentDataSource } from '../datasources';
import { ShipmentDataSource } from '../datasources/ShipmentDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { ShipmentsArgs } from '../resolvers/queries/ShipmentsQuery';
import { logger } from '../utils/Logger';
import { ShipmentAuthorization } from '../utils/ShipmentAuthorization';

export default class ShipmentQueries {
  constructor(
    private dataSource: ShipmentDataSource,
    private shipmentAuthorization: ShipmentAuthorization
  ) {}

  async getShipment(agent: UserWithRole | null, shipmentId: number) {
    if (!this.shipmentAuthorization.hasReadRights(agent, shipmentId)) {
      logger.logWarn('Unauthorized getShipment access', { agent, shipmentId });

      return null;
    }

    return shipmentDataSource.get(shipmentId);
  }

  async getShipments(agent: UserWithRole | null, args: ShipmentsArgs) {
    let shipments = await this.dataSource.getAll(args);

    shipments = await Promise.all(
      shipments.map(shipment =>
        this.shipmentAuthorization.hasReadRights(agent, shipment.id)
      )
    ).then(results => shipments.filter((_v, index) => results[index]));

    return shipments;
  }

  @Authorized([Roles.USER_OFFICER, Roles.SAMPLE_SAFETY_REVIEWER])
  async getShipmentsByCallId(user: UserWithRole | null, callId: number) {
    return await this.dataSource.getShipmentsByCallId(callId);
  }
}
