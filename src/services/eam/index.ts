// This is work in progress implementation for EAM service
import { logger } from '@user-office-software/duo-logger';
import axios from 'axios';
import { ModuleOptions, ResourceOwnerPassword } from 'simple-oauth2';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ScheduledEventDataSource } from '../../datasources/ScheduledEventDataSource';
import { AnswerBasic } from '../../models/Questionary';
import {
  WEIGHT_KEY,
  WIDTH_KEY,
  HEIGHT_KEY,
  LENGTH_KEY,
  IS_DANGEROUS_GOODS_KEY,
  DANGEROUS_GOODS_UN_NUMBER_KEY,
  DANGEROUS_GOODS_DETAILS_KEY,
  SHIPMENT_SAMPLE_RISKS_KEY,
  PARCEL_VALUE_KEY,
  SHIPMENT_SENDER_COMPANY_KEY,
  SHIPMENT_SENDER_STREET_ADDRESS_KEY,
  SHIPMENT_SENDER_ZIP_CODE_KEY,
  SHIPMENT_SENDER_CITY_COUNTRY_KEY,
  SHIPMENT_SENDER_NAME_KEY,
  SHIPMENT_SENDER_EMAIL_KEY,
  SHIPMENT_SENDER_PHONE_KEY,
} from '../../models/Shipment';
import { ProposalDataSource } from './../../datasources/ProposalDataSource';
import { QuestionaryDataSource } from './../../datasources/QuestionaryDataSource';
import { ShipmentDataSource } from './../../datasources/ShipmentDataSource';
import { UserDataSource } from './../../datasources/UserDataSource';
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

const getAnswerForNumberInput = (
  answerBasic: AnswerBasic | null
): number | undefined => answerBasic?.answer?.value?.value;

const getAnswerForStringInput = (
  answerBasic: AnswerBasic | null
): string | undefined => answerBasic?.answer?.value;

const getAnswerForBooleanInput = (
  answerBasic: AnswerBasic | null
): boolean | undefined => answerBasic?.answer?.value;

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
    @inject(Tokens.UserDataSource)
    private userDataSource: UserDataSource
  ) {}

  createAndLogError(message: string, context: Record<string, unknown>) {
    logger.logError(message, context);

    return new Error(message);
  }
  getEnvOrThrow(envVariable: EnvVars) {
    const value = process.env[envVariable];
    if (!value) {
      throw this.createAndLogError(
        `Environmental variable ${envVariable} is not set`,
        {
          envVariable,
          value,
        }
      );
    }

    return value;
  }

  async performApiRequest(requestData: string) {
    const accessToken = await this.getToken();

    const response = await axios({
      method: 'post',
      url: `${this.getEnvOrThrow(
        'EAM_API_URL'
      )}/infor/CustomerApi/EAMWS/EAMTESTAPI/EWSConnector`,
      data: requestData,
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': `${requestData.length}`,
        Authorization: `Bearer ${accessToken.token.access_token}`,
      },
    }).catch((error) => {
      const { message, response } = error;
      throw this.createAndLogError('Error while calling EAM API', {
        message,
        requestData,
        responseData: response?.data,
      });
    });

    if (response.status !== 200) {
      throw this.createAndLogError('Failed to execute registerAssetInEAM', {
        response,
      });
    }

    return response.data as string;
  }

  private async createTicket(shipmentId: number, containerId: string) {
    const shipment = await this.shipmentDataSource.getShipment(shipmentId);
    if (!shipment) {
      throw this.createAndLogError('Shipment for ticket not found', {
        shipmentId,
      });
    }

    const proposal = await this.proposalDataSource.get(shipment.proposalPk);
    if (!proposal) {
      throw this.createAndLogError('Proposal for ticket not found', {
        shipment,
      });
    }

    const scheduledEvent =
      await this.scheduledEventDataSource.getScheduledEventCore(
        shipment.scheduledEventId
      );
    if (!scheduledEvent) {
      throw this.createAndLogError('Scheduled event for ticket not found', {
        shipment,
      });
    }

    let localContact = null;
    if (scheduledEvent.localContactId) {
      localContact = await this.userDataSource.getUser(
        scheduledEvent.localContactId
      );
    }
    const request = getCreateTicketReq(
      proposal.proposalId,
      proposal.title,
      containerId,
      scheduledEvent.startsAt,
      scheduledEvent.endsAt,
      scheduledEvent.startsAt, // This is not correct, but we need a design decision to fix this
      localContact?.email ?? 'not set'
    );

    await this.performApiRequest(request);
  }
  /**
   * Creates container in EAM
   * @returns newly created container ID
   */
  private async createContainer(shipmentId: number) {
    const shipment = await this.shipmentDataSource.getShipment(shipmentId);
    if (!shipment) {
      throw this.createAndLogError('Shipment for container not found', {
        shipmentId,
      });
    }

    const proposal = await this.proposalDataSource.get(shipment.proposalPk);
    if (!proposal) {
      throw this.createAndLogError('Proposal for container not found', {
        shipment,
      });
    }

    const weight = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      WEIGHT_KEY
    );
    const width = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      WIDTH_KEY
    );
    const height = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      HEIGHT_KEY
    );
    const length = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      LENGTH_KEY
    );

    const isDangerousGoods = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      IS_DANGEROUS_GOODS_KEY
    );
    const dangerousGoodsUnNumber = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      DANGEROUS_GOODS_UN_NUMBER_KEY
    );
    const dangerousGoodsDetails = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      DANGEROUS_GOODS_DETAILS_KEY
    );
    const shipmentSampleRisks = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      SHIPMENT_SAMPLE_RISKS_KEY
    );
    const parcelValue = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      PARCEL_VALUE_KEY
    );
    const shipmentSenderCompany = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      SHIPMENT_SENDER_COMPANY_KEY
    );
    const shipmentSenderStreetAddress =
      await this.questionaryDataSource.getAnswer(
        shipment.questionaryId,
        SHIPMENT_SENDER_STREET_ADDRESS_KEY
      );
    const shipmentSenderZipCode = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      SHIPMENT_SENDER_ZIP_CODE_KEY
    );
    const shipmentSenderCityCountry =
      await this.questionaryDataSource.getAnswer(
        shipment.questionaryId,
        SHIPMENT_SENDER_CITY_COUNTRY_KEY
      );
    const shipmentSenderName = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      SHIPMENT_SENDER_NAME_KEY
    );
    const shipmentSenderEmail = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      SHIPMENT_SENDER_EMAIL_KEY
    );
    const shipmentSenderPhone = await this.questionaryDataSource.getAnswer(
      shipment.questionaryId,
      SHIPMENT_SENDER_PHONE_KEY
    );

    if (
      !weight ||
      !width ||
      !height ||
      !length ||
      !parcelValue ||
      !shipmentSenderCompany ||
      !shipmentSenderStreetAddress ||
      !shipmentSenderZipCode ||
      !shipmentSenderCityCountry ||
      !shipmentSenderName ||
      !shipmentSenderEmail ||
      !shipmentSenderPhone
    ) {
      throw this.createAndLogError('Template is not properly configured', {
        shipmentId,
        weight,
        width,
        height,
        length,
      });
    }

    const weightAnswer = getAnswerForNumberInput(weight);
    const widthAnswer = getAnswerForNumberInput(width);
    const heightAnswer = getAnswerForNumberInput(height);
    const lengthAnswer = getAnswerForNumberInput(length);
    const isDangerousGoodsAnswer = getAnswerForBooleanInput(isDangerousGoods);
    const dangerousGoodsUnNumberAnswer = getAnswerForStringInput(
      dangerousGoodsUnNumber
    );
    const dangerousGoodsDetailsAnswer = getAnswerForStringInput(
      dangerousGoodsDetails
    );
    const shipmentSampleRisksAnswer =
      getAnswerForStringInput(shipmentSampleRisks);
    const parcelValueAnswer = getAnswerForStringInput(parcelValue);
    const shipmentSenderCompanyAnswer = getAnswerForStringInput(
      shipmentSenderCompany
    );
    const shipmentSenderStreetAddressAnswer = getAnswerForStringInput(
      shipmentSenderStreetAddress
    );
    const shipmentSenderZipCodeAnswer = getAnswerForStringInput(
      shipmentSenderZipCode
    );
    const shipmentSenderCityCountryAnswer = getAnswerForStringInput(
      shipmentSenderCityCountry
    );
    const shipmentSenderNameAnswer =
      getAnswerForStringInput(shipmentSenderName);
    const shipmentSenderEmailAnswer =
      getAnswerForStringInput(shipmentSenderEmail);
    const shipmentSenderPhoneAnswer =
      getAnswerForStringInput(shipmentSenderPhone);

    if (
      !weightAnswer ||
      !widthAnswer ||
      !heightAnswer ||
      !lengthAnswer ||
      !shipmentSampleRisksAnswer ||
      !parcelValueAnswer ||
      !shipmentSenderCompanyAnswer ||
      !shipmentSenderStreetAddressAnswer ||
      !shipmentSenderZipCodeAnswer ||
      !shipmentSenderCityCountryAnswer ||
      !shipmentSenderNameAnswer ||
      !shipmentSenderEmailAnswer ||
      !shipmentSenderPhoneAnswer
    ) {
      throw this.createAndLogError('Answer is missing for shipment creation', {
        shipmentId,
        weight,
        width,
        height,
        length,
        shipmentSampleRisksAnswer,
        parcelValueAnswer,
        shipmentSenderCompanyAnswer,
        shipmentSenderStreetAddressAnswer,
        shipmentSenderZipCodeAnswer,
        shipmentSenderCityCountryAnswer,
        shipmentSenderNameAnswer,
        shipmentSenderEmailAnswer,
        shipmentSenderPhoneAnswer,
      });
    }

    const request = getAddAssetEquipmentReq(
      proposal.proposalId,
      proposal.title,
      weightAnswer,
      widthAnswer,
      heightAnswer,
      lengthAnswer,
      isDangerousGoodsAnswer ? 'true' : 'false',
      dangerousGoodsUnNumberAnswer ?? 'No UN Number',
      dangerousGoodsDetailsAnswer ?? 'No details',
      shipmentSampleRisksAnswer ?? 'No information',
      parcelValueAnswer ?? 'No value',
      shipmentSenderCompanyAnswer ?? 'No value',
      shipmentSenderStreetAddressAnswer ?? 'No value',
      shipmentSenderZipCodeAnswer ?? 'No value',
      shipmentSenderCityCountryAnswer ?? 'No value',
      shipmentSenderNameAnswer ?? 'No value',
      shipmentSenderEmailAnswer ?? 'No value',
      shipmentSenderPhoneAnswer ?? 'No value'
    );

    const response = await this.performApiRequest(request);

    const regexFindEquipmentCode =
      /<ns2:EQUIPMENTCODE>([0-9]*)<\/ns2:EQUIPMENTCODE>/;
    const result = response.match(regexFindEquipmentCode);

    if (!result || result.length < 2) {
      throw this.createAndLogError('Unexpected response from EAM API', {
        response,
      });
    }

    return result[1];
  }

  async register(shipmentId: number) {
    const containerId = await this.createContainer(shipmentId);
    await this.createTicket(shipmentId, containerId);

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
    return '12345';
  }
}
