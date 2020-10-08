import { createWriteStream } from 'fs';
import { ensureDirSync, removeSync } from 'fs-extra';
import fetch, { RequestInit } from 'node-fetch';
import { join } from 'path';
import { useElectronContext } from '../utility/electronContext';

import { BotContentInfo, ContentProviderMetadata, ExternalContentProvider } from './externalContentProvider';

type PowerVirtualAgentsMetadata = ContentProviderMetadata & {
  botId?: string;
  description?: string; // maybe we can derive this from the bot content
  dialogId?: string;
  envId?: string;
  name?: string; // maybe we can derive this from the bot content
  tenantId?: string;
  triggerId?: string;
};

const baseUrl = 'https://bots.int.customercareintelligence.net'; // int = test environment
const authCredentials = {
  clientId: 'ce48853e-0605-4f77-8746-d70ac63cc6bc',
  scopes: ['a522f059-bb65-47c0-8934-7db6e5286414/.default'], // int / ppe
};

export class PowerVirtualAgentsProvider extends ExternalContentProvider {
  private tempBotAssetsDir = join(process.env.COMPOSER_TEMP_DIR as string, 'pva-assets');

  constructor(metadata: PowerVirtualAgentsMetadata) {
    super(metadata);
  }

  public async downloadBotContent(): Promise<BotContentInfo> {
    try {
      // fetch zip
      const url = this.getContentUrl();
      const options: RequestInit = {
        method: 'GET',
        headers: await this.getRequestHeaders(),
      };
      const result = await fetch(url, options);

      const eTag = result.headers.get('etag') || '';
      const contentType = result.headers.get('content-type');
      if (!contentType || contentType !== 'application/zip') {
        throw 'Invalid content type header! Must be application/zip';
      }

      // write the zip to disk
      if (result && result.body) {
        ensureDirSync(this.tempBotAssetsDir);
        const zipPath = join(this.tempBotAssetsDir, 'bot-assets.zip');
        const writeStream = createWriteStream(zipPath);
        await new Promise((resolve, reject) => {
          writeStream.once('finish', resolve);
          writeStream.once('error', reject);
          result.body.pipe(writeStream);
        });
        return { eTag, zipPath };
      } else {
        throw 'Response containing zip does not have a body';
      }
    } catch (e) {
      return Promise.reject(new Error(`Error while trying to download the bot content: ${e}`));
    }
  }

  public async cleanUp(): Promise<void> {
    removeSync(this.tempBotAssetsDir);
  }

  private async getAccessToken(): Promise<string> {
    try {
      // login to the 1P app and get an access token
      const { getAccessToken, loginAndGetIdToken } = useElectronContext();
      const idToken = await loginAndGetIdToken(authCredentials);
      const accessToken = await getAccessToken({ ...authCredentials, idToken });
      return accessToken;
    } catch (e) {
      return Promise.reject(new Error(`Error while trying to get a PVA access token: ${e}`));
    }
  }

  private getContentUrl(): string {
    const { envId, botId } = this.metadata;
    return `${baseUrl}/api/botmanagement/v1/environments/${envId}/bots/${botId}/composer/content`;
  }

  private async getRequestHeaders() {
    const { tenantId } = this.metadata;
    const token = await this.getAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      'X-CCI-TenantId': tenantId,
      'X-CCI-Routing-TenantId': tenantId,
    };
  }
}
