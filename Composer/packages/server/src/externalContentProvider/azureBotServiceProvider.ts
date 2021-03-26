// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { PublishTarget } from '@bfc/shared';
import * as axios from 'axios';
import jwtDecode from 'jwt-decode';

import { authService } from '../services/auth/auth';

import { IContentProviderMetadata, ExternalContentProvider, BotContentInfo } from './externalContentProvider';

export type AzureBotServiceMetadata = IContentProviderMetadata & {
  resourceId: string;
  botName: string;
  appId?: string;
  appPasswordHint?: string;
  subscriptionId?: string;
  resourceGroup?: string;
  armEndpoint?: string;
  tenantId: string;
};

export class AzureBotServiceProvider extends ExternalContentProvider<AzureBotServiceMetadata> {
  constructor(metadata: AzureBotServiceMetadata) {
    super(metadata);
  }
  public async downloadBotContent(): Promise<BotContentInfo> {
    throw new Error('ABS Not support');
  }
  public async cleanUp(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  public async getAlias(): Promise<string> {
    const alias = `abs-${this.metadata.botName}-${this.metadata.appId}`;
    return alias;
  }

  public async authenticate(): Promise<string> {
    return this.getVaultAccessToken();
  }

  public async generateProfile(): Promise<PublishTarget> {
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

    // transform key vault token hint to microsoft app password
    const hint = this.metadata.appPasswordHint || '';
    delete temp.appPasswordHint;
    const vaultNames = hint.match(/vaults\/([^/]*)/);
    const secretNames = hint.match(/secrets\/([^/]*)/);
    const resourceGroupNames = hint.match(/resourceGroups\/([^/]*)/);
    const vaultName = (vaultNames && vaultNames.length > 0 && vaultNames[1]) || '';
    const secretName = (secretNames && secretNames.length > 0 && secretNames[1]) || '';
    const resourceGroupName = (resourceGroupNames && resourceGroupNames.length > 0 && resourceGroupNames[1]) || '';
    const tenantId = this.metadata.tenantId;

    // get token
    const armToken = await this.getArmAccessToken(tenantId);
    const vaultToken = await this.getVaultAccessToken();
    const decoded = jwtDecode<{ oid: string }>(armToken);

    // set key vault policy
    await this.keyVaultUpdatePolicy(armToken, temp.subscriptionId, resourceGroupName, vaultName, tenantId, decoded.oid);
    const appPwd = await this.keyVaultGetSecretValue(vaultToken, vaultName, secretName);
    return {
      name: `abs-${this.metadata.botName}`,
      type: 'azurePublish',
      configuration: JSON.stringify({
        hostname: '',
        runtimeIdentifier: 'win-x64',
        settings: {
          MicrosoftAppId: appId,
          MicrosoftAppPassword: appPwd,
        },
        ...temp,
      }),
    };
  }

  private async keyVaultUpdatePolicy(
    token: string,
    subscriptionId: string,
    resourceGroupName: string,
    vaultName: string,
    tenantId: string,
    objectId: string
  ) {
    try {
      const operationKind = 'add';
      const url = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.KeyVault/vaults/${vaultName}/accessPolicies/${operationKind}?api-version=2019-09-01`;
      const result = await axios.default.put(
        url,
        {
          properties: {
            accessPolicies: [
              {
                tenantId: tenantId,
                objectId: objectId,
                permissions: {
                  secrets: ['get', 'list'],
                },
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return result;
    } catch (e) {
      throw `Error while trying to update key vault policy: ${e.toString()}`;
    }
  }

  private async keyVaultGetSecretValue(token: string, vaultName: string, secretName: string) {
    try {
      const vaultUri = `https://${vaultName}.vault.azure.net/secrets/${secretName}?api-version=7.1`;
      const result = await axios.default.get(vaultUri, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return result.data.value;
    } catch (e) {
      throw `Error while trying to get key vault value ${e.toString()}`;
    }
  }

  private async getVaultAccessToken(): Promise<string> {
    try {
      // get an kv token
      const authCredentials = {
        scopes: ['https://vault.azure.net/user_impersonation'],
        targetResource: 'https://vault.azure.net',
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

  private async getArmAccessToken(tenantId: string): Promise<string> {
    try {
      const accessToken = await authService.getArmAccessToken(tenantId);
      if (accessToken === '') {
        throw 'User cancelled login flow.';
      }
      return accessToken;
    } catch (e) {
      throw `Error while trying to get a key vault token: ${e.toString()}`;
    }
  }
}
