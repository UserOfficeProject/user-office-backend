import { logger } from '@esss-swap/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ShipmentDataSource } from '../datasources/ShipmentDataSource';
import { Authorized } from '../decorators';
import { Questionary } from '../models/Questionary';
import { Roles } from '../models/Role';
import { Shipment } from '../models/Shipment';
import { TemplateGroupId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { ShipmentsArgs } from '../resolvers/queries/ShipmentsQuery';
import { ShipmentAuthorization } from '../utils/ShipmentAuthorization';
import { QuestionaryDataSource } from './../datasources/QuestionaryDataSource';
import { TemplateDataSource } from './../datasources/TemplateDataSource';

@injectable()
export default class ShipmentQueries {
  constructor(
    @inject(Tokens.ShipmentDataSource)
    private dataSource: ShipmentDataSource,

    @inject(Tokens.ShipmentAuthorization)
    private shipmentAuthorization: ShipmentAuthorization,

    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,

    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource
  ) {}

  async getShipment(agent: UserWithRole | null, shipmentId: number) {
    const hasRights = await this.shipmentAuthorization.hasReadRights(
      agent,
      shipmentId
    );
    if (hasRights == false) {
      logger.logWarn('Unauthorized getShipment access', { agent, shipmentId });

      return null;
    }

    return this.dataSource.getShipment(shipmentId);
  }

  @Authorized()
  async getShipments(agent: UserWithRole | null, args: ShipmentsArgs) {
    let shipments = await this.dataSource.getShipments(args);

    shipments = await Promise.all(
      shipments.map((shipment) =>
        this.shipmentAuthorization.hasReadRights(agent, shipment)
      )
    ).then((results) => shipments.filter((_v, index) => results[index]));

    return shipments;
  }

  @Authorized([Roles.USER_OFFICER, Roles.SAMPLE_SAFETY_REVIEWER])
  async getShipmentsByCallId(user: UserWithRole | null, callId: number) {
    return await this.dataSource.getShipmentsByCallId(callId);
  }

  @Authorized()
  async getMyShipments(agent: UserWithRole | null) {
    let shipments = await this.dataSource.getShipments({
      filter: { creatorId: agent!.id },
    });

    shipments = await Promise.all(
      shipments.map((shipment) =>
        this.shipmentAuthorization.hasReadRights(agent, shipment)
      )
    ).then((results) => shipments.filter((_v, index) => results[index]));

    return shipments;
  }

  async getQuestionaryOrDefault(
    user: UserWithRole | null,
    shipment: Shipment
  ): Promise<Questionary | null> {
    const questionary = await this.questionaryDataSource.getQuestionary(
      shipment.questionaryId
    );
    if (questionary) {
      return questionary;
    }

    const activeTemplateId = await this.templateDataSource.getActiveTemplateId(
      TemplateGroupId.SHIPMENT
    );
    if (!activeTemplateId) {
      return null;
    }

    return new Questionary(0, activeTemplateId, user!.id, new Date());
  }
}
