// This is work in progress implementation for EAM service
import { logger } from '@esss-swap/duo-logger';
import axios from 'axios';
import { ModuleOptions, ResourceOwnerPassword } from 'simple-oauth2';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalDataSource } from './../../datasources/ProposalDataSource';
import { QuestionaryDataSource } from './../../datasources/QuestionaryDataSource';
import { ScheduledEventDataSource } from './../../datasources/ScheduledEventDataSource';
import { ShipmentDataSource } from './../../datasources/ShipmentDataSource';
import { VisitDataSource } from './../../datasources/VisitDataSource';
import getAddAssetEquipmentReq from './requests/AddAssetEquipment';
import getCreateTicketReq from './requests/AddCaseManagement';

export interface AssetRegistrar {
  register(shipmentId: number): Promise<string>;
}

type EnvVars =
  | 'EAM_API_URL'
  | 'EAM_AUTH_URL'
  | 'EAM_AUTH_SECRET'
  | 'EAM_AUTH_USER'
  | 'EAM_AUTH_PASS';

const WEIGHT_QUESTION_ID = 'parcel_weight';
const WIDTH_QUESTION_ID = 'parcel_width';
const HEIGHT_QUESTION_ID = 'parcel_height';
const LENGTH_QUESTION_ID = 'parcel_length';

@injectable()
export class EAMAssetRegistrar implements AssetRegistrar {
  constructor(
    @inject(Tokens.ShipmentDataSource)
    private shipmentDataSource: ShipmentDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.ScheduledEventDataSource)
    private scheduledEventDataSource: ScheduledEventDataSource,
    @inject(Tokens.VisitDataSource)
    private visitDataSource: VisitDataSource
  ) {}

  getEnvOrThrow(envVariable: EnvVars) {
    const value = process.env[envVariable];
    if (!value) {
      logger.logError(`Environmental variable ${envVariable} is not set`, {
        envVariable,
        value,
      });
      throw new Error(`Environmental variable ${envVariable} is not set`);
    }

    return value;
  }

  async performApiRequest(request: string) {
    const accessToken = await this.getToken();

    console.log(
      `${this.getEnvOrThrow(
        'EAM_API_URL'
      )}/infor/CustomerApi/EAMWS/EAMTESTAPI/EWSConnector`
    );

    console.log(`Authorization: Bearer ${accessToken?.token.access_token}`);

    const response = await axios({
      method: 'post',
      url: `${this.getEnvOrThrow(
        'EAM_API_URL'
      )}/infor/CustomerApi/EAMWS/EAMTESTAPI/EWSConnector`,
      data: request,
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': `${request.length}`,
        Authorization: `Bearer ${accessToken?.token.access_token}`,
      },
    });

    if (response.status !== 200) {
      logger.logError('Failed to execute registerAssetInEAM', { response });
      throw new Error('Failed to execute registerAssetInEAM');
    }

    return response.data as string;
  }

  private async createTicket(containerId: string) {
    const shpiment = await this.shipmentDataSource.getShipments({});
    const request = getCreateTicketReq(
      'proposalTitle',
      containerId,
      new Date(),
      new Date(),
      new Date()
    );
  }
  /**
   * Creates container in EAM
   * @returns newly created container ID
   */
  private async createContainer(shipmentId: number) {
    const shipment = await this.shipmentDataSource.getShipment(shipmentId);
    if (!shipment) {
      logger.logError('Shipment not found', { shipmentId });
      throw new Error('Shipment not found');
    }

    const proposal = await this.proposalDataSource.get(shipment.proposalPk);
    if (!proposal) {
      logger.logError('Proposal for shipment not found', { shipment });
      throw new Error('Proposal not found');
    }

    const weight = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      WEIGHT_QUESTION_ID
    );
    const width = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      WIDTH_QUESTION_ID
    );
    const height = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      HEIGHT_QUESTION_ID
    );
    const length = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      LENGTH_QUESTION_ID
    );

    if (!weight || !width || !height || !length) {
      logger.logError(
        'Can not create shipment because shipment template is not properly configured',
        { shipmentId, weight, width, height, length }
      );
      throw new Error('Could not create shipment');
    }

    const request = getAddAssetEquipmentReq(
      proposal.title,
      weight.answer.value,
      width.answer.value,
      height.answer.value,
      length.answer.value
    );

    const response = await this.performApiRequest(request);

    const regexFindEquipmentCode =
      /<ns2:EQUIPMENTCODE>([0-9]*)<\/ns2:EQUIPMENTCODE>/;
    const result = response.match(regexFindEquipmentCode);

    if (!result || result.length < 2) {
      logger.logError('Unexpected response from EAM API', { response });
      throw new Error('Unexpected response from EAM API');
    }

    return result[1];
  }

  async register(shipmentId: number) {
    const containerId = await this.createContainer(shipmentId);
    //await this.createTicket(containerId);

    return containerId;
  }

  async getToken() {
    const config: ModuleOptions = {
      client: {
        id: 'infor~pAVcElz8D8rmSWLPp9TmHDwLTOpOo2f3OW-2DDpW5xg',
        secret: this.getEnvOrThrow('EAM_AUTH_SECRET'),
      },
      auth: {
        tokenHost: this.getEnvOrThrow('EAM_AUTH_URL'),
        tokenPath: 'InforIntSTS/connect/token',
      },
    };
    const client = new ResourceOwnerPassword(config);

    const tokenParams = {
      username: this.getEnvOrThrow('EAM_AUTH_USER'),
      password: this.getEnvOrThrow('EAM_AUTH_PASS'),
      scope: 'offline_access',
    };

    try {
      return await client.getToken(tokenParams);
    } catch (error) {
      logger.logException('Access Token Error', error);
      throw new Error('Access Token Error');
    }
  }
}

export class SkipAssetRegistrar implements AssetRegistrar {
  async register(): Promise<string> {
    return '';
  }
}
