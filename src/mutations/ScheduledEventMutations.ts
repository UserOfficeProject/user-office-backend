import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ScheduledEventDataSource } from '../datasources/ScheduledEventDataSource';
import { Authorized } from '../decorators';
import { Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { UpdateScheduledEventArgs } from '../resolvers/mutations/UpdateScheduledEventCoreMutation';
import { ShipmentAuthorization } from './../auth/ShipmentAuthorization';
import { UserAuthorization } from './../auth/UserAuthorization';
import { ShipmentDataSource } from './../datasources/ShipmentDataSource';
import { ScheduledEventCore } from './../models/ScheduledEventCore';

@injectable()
export default class ScheduledEventMutations {
  private shipmentAuth = container.resolve(ShipmentAuthorization);
  private userAuth = container.resolve(UserAuthorization);
  constructor(
    @inject(Tokens.ScheduledEventDataSource)
    private scheduledEventDataSource: ScheduledEventDataSource,
    @inject(Tokens.ShipmentDataSource)
    private shipmentDataSource: ShipmentDataSource
  ) {}

  @Authorized([Roles.USER_OFFICER, Roles.USER])
  async updateScheduledEvent(
    user: UserWithRole | null,
    args: UpdateScheduledEventArgs
  ): Promise<ScheduledEventCore | Rejection> {
    if (args.isShipmentDeclared !== undefined) {
      const shipments = await this.shipmentDataSource.getShipments({
        filter: { scheduledEventId: args.scheduledEventId },
      });
      if (shipments.length === 0) {
        return new Rejection('No shipments found for scheduled event');
      }

      const shipment = shipments[0];

      if (!this.shipmentAuth.hasWriteRights(user, shipment)) {
        return new Rejection('You do not have write rights for this shipment');
      }
    }

    return this.scheduledEventDataSource.updateScheduledEvent(args);
  }
}
