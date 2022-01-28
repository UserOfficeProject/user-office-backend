import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ScheduledEventDataSource } from '../datasources/ScheduledEventDataSource';
import { ShipmentAuthorization } from './../auth/ShipmentAuthorization';
import { UserAuthorization } from './../auth/UserAuthorization';
import { ShipmentDataSource } from './../datasources/ShipmentDataSource';

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
}
