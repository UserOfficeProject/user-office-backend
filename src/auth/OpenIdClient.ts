import { logger } from '@user-office-software/duo-logger';
import { BaseClient, Issuer } from 'openid-client';

export class OpenIdClient {
  private static instance: BaseClient;

  static async getInstance() {
    if (!this.instance) {
      this.instance = await this.createClient();
    }

    return this.instance;
  }

  private static async createClient() {
    const { discoveryUrl, clientId, clientSecret, redirectUrl } =
      this.getConfig();

    if (!discoveryUrl || !clientId || !clientSecret || !redirectUrl) {
      logger.logError('One or more ENV variables not defined', {
        discoveryUrl,
        clientId,
        clientSecret: clientSecret ? '******' : undefined,
        redirectUrl,
      });
      throw new Error('One or more ENV variables not defined');
    }

    const OpenIDIssuer = await Issuer.discover(discoveryUrl);

    return new OpenIDIssuer.Client({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uris: [redirectUrl],
      response_types: ['code'],
    });
  }

  private static getConfig() {
    const discoveryUrl = process.env.AUTH_DISCOVERY_URL;
    const clientId = process.env.AUTH_CLIENT_ID;
    const clientSecret = process.env.AUTH_CLIENT_SECRET;
    const redirectUrl = process.env.AUTH_REDIRECT_URI;

    return {
      discoveryUrl,
      clientId,
      clientSecret,
      redirectUrl,
    };
  }

  public static hasConfiguration() {
    const { discoveryUrl, clientId, clientSecret, redirectUrl } =
      this.getConfig();

    return discoveryUrl && clientId && clientSecret && redirectUrl;
  }
}
