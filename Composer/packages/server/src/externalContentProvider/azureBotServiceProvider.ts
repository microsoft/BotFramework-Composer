// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { authService } from '../services/auth/auth';

import { IContentProviderMetadata, ExternalContentProvider, BotContentInfo } from './externalContentProvider';

export type AzureBotServiceMetadata = IContentProviderMetadata & {
  resourceId: string;
  botName: string;
  appId?: string;
  appPasswordHint: string;
  subscriptionId?: string;
  resourceGroup?: string;
  armEndpoint?: string;
};

export class AzureBotServiceProvider extends ExternalContentProvider<AzureBotServiceMetadata> {
  constructor(metadata: AzureBotServiceMetadata) {
    super(metadata);
  }
  downloadBotContent(): Promise<BotContentInfo> {
    throw new Error('ABS Not support');
  }
  cleanUp(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  public async getAlias(): Promise<string> {
    const alias = `abs-${this.metadata.botName}-${this.metadata.appId}`;
    return alias;
  }

  public async generateProfile(): Promise<object> {
    const appId = this.metadata.appId;
    // parse subscriptionId ... from this.metadata
    const temp = { ...this.metadata };
    const subs = this.metadata.resourceId.match(/subscriptions\/([\w-]*)\//);
    const groups = this.metadata.resourceId.match(/resourceGroups\/([^/]*)/);
    const names = this.metadata.resourceId.match(/botServices\/([^/]*)/);
    temp.subscriptionId = (subs && subs.length > 0 && subs[1]) || '';
    temp.resourceGroup = (groups && groups.length > 0 && groups[1]) || '';
    temp.botName = (names && names.length > 0 && names[1]) || '';
    delete temp.appId;

    //TODO. handle key vault hint
    const resu = await this.getAccessToken();
    console.log(resu);

    return {
      name: `abs-${this.metadata.botName}`,
      type: 'azurePublish',
      configuration: JSON.stringify({
        hostname: '',
        runtimeIdentifier: 'win-x64',
        settings: {
          MicrosoftAppId: appId,
        },
        ...temp,
      }),
    };
  }

  public async authenticate(): Promise<string> {
    return this.getAccessToken();
  }
  private async getAccessToken(): Promise<string> {
    try {
      // get an kv token
      const authCredentials = {
        scopes: ['https://vault.azure.net/user_impersonation'],
        targetResource: 'https://vault.azure.net/',
      };
      const accessToken = await authService.getAccessToken(authCredentials);
      if (accessToken === '') {
        throw 'User cancelled login flow.';
      }
      return accessToken;
    } catch (e) {
      throw `Error while trying to get a key vault token: ${e.toString()}`;
    }
  }
}
