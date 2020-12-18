import { IContentProviderMetadata, ExternalContentProvider } from './externalContentProvider';
// import { authService } from '../services/auth/auth';
// import logger from '../logger';
import { join } from 'path';
import { remove, ensureDirSync } from 'fs-extra';
// import { urlencoded } from 'body-parser';

function prettyPrintError(err: string | Error): string {
  if (typeof err === 'string') {
    return err;
  }
  if (err && err.message) {
    return err.message;
  }
  return '';
}

export type AzureBotServiceMetadata = IContentProviderMetadata & {
  botId?: string;
  botName?: string;
  appId: string;
  subscriptionId: string;
  resourceGroup?: string;
  keyvaultSecret?: string;
  resourceId: string;
};

export class AzureBotServiceProvider extends ExternalContentProvider<AzureBotServiceMetadata> {
  private tempBotAssetsDir = join(process.env.COMPOSER_TEMP_DIR as string, 'abs-assets');

  constructor(metadata: AzureBotServiceMetadata) {
    super(metadata);
  }

  public async downloadBotContent() {
    const { resourceId } = this.metadata;
    /**
     * TODO: get download url from payload, then download zip
     * then write the zip to disk
     */
    if (resourceId) {
      // get resource by resourceId
    }
    ensureDirSync(this.tempBotAssetsDir);
    const zipPath = join(this.tempBotAssetsDir, 'EchoBot-1.zip');

    // const writeStream = createWriteStream(zipPath);
    // await new Promise((resolve, reject) => {
    //   writeStream.once('finish', resolve);
    //   writeStream.once('error', reject);
    //   result.body.pipe(writeStream);
    // });
    // fetch zip
    return {
      zipPath: zipPath,
      eTag: '',
      urlSuffix: this.getDeepLink(),
    };
  }
  public async cleanUp() {
    await remove(this.tempBotAssetsDir);
  }
  public async getAlias() {
    return '';
  }
  public async authenticate() {
    return await this.getAccessToken();
  }
  private async getAccessToken(): Promise<string> {
    try {
      // const accessToken = await authService.getAccessToken({
      //   targetResource: 'https://management.core.windows.net/',
      // });
      // if (accessToken === '') {
      //   throw 'User cancelled login flow.';
      // }
      // return accessToken;
      return 'test token';
    } catch (error) {
      console.log(error);
      throw `Error while trying to get access token: ${prettyPrintError(error)}`;
    }
  }
  private getDeepLink(): string {
    // use metadata (if provided) to create a deep link to a specific dialog / trigger / action etc. after opening bot.
    let deepLink = '';
    const { dialogId, triggerId, actionId = '' } = this.metadata;

    if (dialogId) {
      deepLink += `dialogs/${dialogId}`;
    }
    if (dialogId && triggerId) {
      deepLink += `?selected=triggers[${encodeURIComponent(`"${triggerId}"`)}]`;
    }
    if (dialogId && triggerId && actionId) {
      deepLink += `&focused=triggers[${encodeURIComponent(`"${triggerId}"`)}].actions[${encodeURIComponent(
        `"${actionId}"`
      )}]`;
    }
    // base64 encode to make parsing on the client side easier
    return Buffer.from(deepLink, 'utf-8').toString('base64');
  }
}
