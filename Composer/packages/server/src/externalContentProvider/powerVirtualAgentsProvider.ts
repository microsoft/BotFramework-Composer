// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createWriteStream } from 'fs';
import { join } from 'path';

import { ensureDirSync, remove } from 'fs-extra';
import fetch, { RequestInit } from 'node-fetch';

import logger from '../logger';
import { authService } from '../services/auth/auth';

import { BotContentInfo, IContentProviderMetadata, ExternalContentProvider } from './externalContentProvider';

const log = logger.extend('pva-provider');

const COMPOSER_1P_APP_ID = 'ce48853e-0605-4f77-8746-d70ac63cc6bc';
const PVA_TEST_APP_ID = 'a522f059-bb65-47c0-8934-7db6e5286414';
const PVA_PROD_APP_ID = '96ff4394-9197-43aa-b393-6a41652e21f8';

export type PowerVirtualAgentsMetadata = IContentProviderMetadata & {
  baseUrl: string;
  botId: string;
  dialogId?: string;
  envId: string;
  name: string;
  tenantId: string;
  triggerId?: string;
};

const getAuthCredentials = (baseUrl: string) => {
  const url = new URL(baseUrl);
  if (url.hostname.includes('.int.') || url.hostname.includes('.ppe.')) {
    log('Using INT / PPE auth credentials.');
    return {
      clientId: COMPOSER_1P_APP_ID,
      scopes: [`${PVA_TEST_APP_ID}/.default`],
      targetResource: PVA_TEST_APP_ID,
    };
  }
  log('Using PROD auth credentials.');
  return {
    clientId: COMPOSER_1P_APP_ID,
    scopes: [`${PVA_PROD_APP_ID}/.default`],
    targetResource: PVA_PROD_APP_ID,
  };
};

const getBaseUrl = () => {
  const pvaEnv = (process.env.COMPOSER_PVA_ENV || '').toLowerCase();
  switch (pvaEnv) {
    case 'prod': {
      const url = 'https://powerva.microsoft.com/api/botmanagement/v1';
      log('PROD env detected, grabbing PVA content from %s', url);
      return url;
    }

    case 'ppe': {
      const url = 'https://bots.ppe.customercareintelligence.net/api/botmanagement/v1';
      log('PPE env detected, grabbing PVA content from %s', url);
      return url;
    }

    case 'int': {
      const url = 'https://bots.int.customercareintelligence.net/api/botmanagement/v1';
      log('INT env detected, grabbing PVA content from %s', url);
      return url;
    }

    default: {
      const url = 'https://bots.int.customercareintelligence.net/api/botmanagement/v1';
      log('No env flag detected, grabbing PVA content from %s', url);
      return url;
    }
  }
};

function prettyPrintError(err: string | Error): string {
  if (typeof err === 'string') {
    return err;
  }
  if (err?.message) {
    return err.message;
  }
  return '';
}

export class PowerVirtualAgentsProvider extends ExternalContentProvider<PowerVirtualAgentsMetadata> {
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
        const json = await result.json();
        throw new Error(`Did not receive zip back from PVA: ${prettyPrintError(json)}`);
      }

      // write the zip to disk
      if (result?.body) {
        ensureDirSync(this.tempBotAssetsDir);
        const zipPath = join(this.tempBotAssetsDir, `bot-assets-${Date.now()}.zip`);
        const writeStream = createWriteStream(zipPath);
        await new Promise((resolve, reject) => {
          writeStream.once('finish', resolve);
          writeStream.once('error', reject);
          result.body.pipe(writeStream);
        });
        return { eTag, zipPath, urlSuffix: this.getDeepLink() };
      } else {
        throw new Error('Response containing zip does not have a body');
      }
    } catch (e) {
      throw new Error(`Error while trying to download the bot content: ${prettyPrintError(e)}`);
    }
  }

  public async cleanUp(): Promise<void> {
    await remove(this.tempBotAssetsDir);
  }

  public async getAlias(): Promise<string> {
    const alias = `${this.metadata.envId}.${this.metadata.botId}`;
    return alias;
  }

  public async authenticate(): Promise<string> {
    return this.getAccessToken();
  }

  private async getAccessToken(): Promise<string> {
    try {
      // login to the 1P app and get an access token
      const { baseUrl } = this.metadata;
      const authCredentials = getAuthCredentials(baseUrl || getBaseUrl());
      const accessToken = await authService.getAccessToken(authCredentials);
      if (accessToken === '') {
        throw 'User cancelled login flow.';
      }
      return accessToken;
    } catch (e) {
      throw `Error while trying to get a PVA access token: ${prettyPrintError(e)}`;
    }
  }

  private getContentUrl(): string {
    const { envId, baseUrl, botId } = this.metadata;
    return `${baseUrl || getBaseUrl()}/environments/${envId}/bots/${botId}/composer/content`;
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
