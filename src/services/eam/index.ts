// This is work in progress implementation for EAM service
import { logger } from '@esss-swap/duo-logger';
import axios from 'axios';
import { ModuleOptions, ResourceOwnerPassword } from 'simple-oauth2';

import addAssetEquipmentReq from './requests/AddAssetEquipment';

export interface AssetRegistrar {
  register(): Promise<string>;
}

type EnvVars =
  | 'EAM_API_URL'
  | 'EAM_AUTH_URL'
  | 'EAM_AUTH_SECRET'
  | 'EAM_AUTH_USER'
  | 'EAM_AUTH_PASS';

export class EAMAssetRegistrar implements AssetRegistrar {
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

    const response = await axios({
      method: 'post',
      url: `${this.getEnvOrThrow(
        'EAM_API_URL'
      )}/infor/CustomerApi/EAMWS/EAMTESTAPI/EWSConnector`,
      data: request,
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': `${addAssetEquipmentReq.length}`,
        Authorization: `Bearer ${accessToken?.token.access_token}`,
      },
    });

    if (response.status !== 200) {
      logger.logError('Failed to execute registerAssetInEAM', { response });
      throw new Error('Failed to execute registerAssetInEAM');
    }

    return response.data as string;
  }

  async register() {
    const response = await this.performApiRequest(addAssetEquipmentReq);

    const regexFindEquipmentCode =
      /<ns2:EQUIPMENTCODE>([0-9]*)<\/ns2:EQUIPMENTCODE>/;
    const result = response.match(regexFindEquipmentCode);

    if (!result || result.length < 2) {
      logger.logError('Unexpected response from EAM API', { response });
      throw new Error('Unexpected response from EAM API');
    }

    return result[1];
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
