// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import axios from 'axios';
import { KeyVaultManagementClient } from '@azure/arm-keyvault-profile-2020-09-01-hybrid';
import { TokenCredentials } from '@azure/ms-rest-js';
import { WebSiteManagementClient } from '@azure/arm-appservice';

import { PublishStep, OnDeploymentProgress, PublishingWorkingSet } from './types';

const createKeyVaultHelper = (creds: TokenCredentials, subscriptionId: string) => {
  const getWebAppIdentity = async (resourceGroupName: string, webAppName: string) => {
    const webSiteManagementClient = new WebSiteManagementClient(creds, subscriptionId);
    const result = await webSiteManagementClient.webApps.get(resourceGroupName, webAppName);

    const response = result?._response;
    if (response?.status >= 300) {
      throw new Error(`Failed to get web app. ${response?.bodyAsText}`);
    }

    return response.parsedBody.identity.principalId;
  };

  const getWebAppSecretUri = async (resourceGroupName: string, vaultName: string, secretName: string) => {
    // const vaultUrl = `https://${vaultName}.vault.azure.net/`;
    // const keyVaultClient = new SecretClient(vaultUrl, this.creds);
    // const getResult = await keyVaultClient.getSecret(secretName);
    // return getResult.properties.id;
    const keyVaultManagementClient = new KeyVaultManagementClient(creds, subscriptionId);
    const result = await keyVaultManagementClient.secrets.get(resourceGroupName, vaultName, secretName);

    const response = result?._response;
    if (response?.status >= 300) {
      throw new Error(`Failed to get keyvault secret. ${response?.bodyAsText}`);
    }

    return response.parsedBody.properties.secretUri;
  };

  const getWebAppSecretValue = async (resourceGroupName: string, vaultName: string, secretName: string) => {
    // const vaultUrl = `https://${vaultName}.vault.azure.net/`;
    // const keyVaultClient = new SecretClient(vaultUrl, this.creds);
    // const getResult = await keyVaultClient.getSecret(secretName);
    // this.logger({
    //     status: BotProjectDeployLoggerType.DEPLOY_INFO,
    //     message: JSON.stringify(getResult)
    // })
    // return getResult.value;
    const keyVaultManagementClient = new KeyVaultManagementClient(creds, subscriptionId);
    const result = await keyVaultManagementClient.secrets.get(resourceGroupName, vaultName, secretName);
    const response = result?._response;
    if (response?.status >= 300) {
      throw new Error(`Failed to get keyvault secret value. ${response?.bodyAsText}`);
    }

    return response.parsedBody.properties.value;
  };

  const setKeyVaultPolicy = async (
    resourceGroupName: string,
    vaultName: string,
    email: string,
    objectId: string,
    tenantId: string
  ) => {
    const keyVaultManagementClient = new KeyVaultManagementClient(creds, subscriptionId);
    const result = await keyVaultManagementClient.vaults.update(resourceGroupName, vaultName, {
      properties: {
        accessPolicies: [
          {
            objectId: objectId,
            permissions: {
              secrets: ['get', 'list'],
            },
            tenantId: tenantId,
          },
        ],
      },
    });

    const response = result?._response;
    if (response?.status >= 300) {
      throw new Error(`Failed to set keyvault policy. ${response?.bodyAsText}`);
    }
  };

  const updateWebAppIdentity = async (resourceGroupName: string, webAppName: string) => {
    const webSiteManagementClient = new WebSiteManagementClient(creds, subscriptionId);
    const result = await webSiteManagementClient.webApps.update(resourceGroupName, webAppName, {
      identity: {
        type: 'SystemAssigned',
      },
    });

    const response = result?._response;
    if (response?.status >= 300) {
      throw new Error(`Failed to update web app. ${response?.bodyAsText}`);
    }
  };

  const updateWebAppSecretUri = async (resourceGroupName: string, webAppName: string, secretUri: string) => {
    const webSiteManagementClient = new WebSiteManagementClient(creds, subscriptionId);
    const result = await webSiteManagementClient.webApps.updateApplicationSettings(resourceGroupName, webAppName, {
      properties: {
        MicrosoftAppPassword: `@Microsoft.KeyVault(SecretUri=${secretUri})`,
      },
    });
    const response = result?._response;
    if (response?.status >= 300) {
      throw new Error(`Failed to update app settings. ${response?.bodyAsText}`);
    }
  };

  const updateWebAppSecretValue = async (resourceGroupName: string, webAppName: string, secretValue: string) => {
    const webSiteManagementClient = new WebSiteManagementClient(creds, subscriptionId);
    const result = await webSiteManagementClient.webApps.updateApplicationSettings(resourceGroupName, webAppName, {
      properties: {
        MicrosoftAppPassword: secretValue,
      },
    });
    const response = result?._response;
    if (response?.status >= 300) {
      throw new Error(`Failed to update app settings. ${response?.bodyAsText}`);
    }
  };

  return {
    getWebAppIdentity,
    getWebAppSecretUri,
    getWebAppSecretValue,
    setKeyVaultPolicy,
    updateWebAppIdentity,
    updateWebAppSecretUri,
    updateWebAppSecretValue,
  };
};

const getTenantId = async (accessToken: string, subId: string) => {
  if (!accessToken) {
    throw new Error(
      'Error: Missing access token. Please provide a non-expired Azure access token. Tokens can be obtained by running az account get-access-token'
    );
  }
  if (!subId) {
    throw new Error(`Error: Missing subscription Id. Please provide a valid Azure subscription id.`);
  }
  try {
    const tenantUrl = `https://management.azure.com/subscriptions/${subId}?api-version=2020-01-01`;
    const options = {
      headers: { Authorization: `Bearer ${accessToken}` },
    };
    const response = await axios.get<string>(tenantUrl, options);
    const jsonRes = JSON.parse(response.data);
    if (jsonRes.tenantId === undefined) {
      throw new Error(`No tenants found in the account.`);
    }
    return jsonRes.tenantId;
  } catch (err) {
    throw new Error(`Get Tenant Id Failed`);
  }
};

type StepConfig = {
  accessToken: string;
  appPasswordHint: string;
  email: string;
  hostname: string;
  resourceGroupName: string;
  secretName: string;
  subscriptionId: string;
  vaultName: string;
};

export const createBindToKeyVaultStep = (config: StepConfig): PublishStep => {
  const execute = async (workingSet: PublishingWorkingSet, onProgress: OnDeploymentProgress): Promise<void> => {
    const {
      accessToken,
      appPasswordHint,
      email,
      hostname,
      resourceGroupName,
      secretName,
      subscriptionId,
      vaultName,
    } = config;

    if (!appPasswordHint || !hostname) {
      onProgress(400, 'Skipped binding to key vault. Missing settings.');
      return;
    }

    const webAppName = hostname;

    onProgress(
      202,
      `Binding to key vault. Subscription: ${subscriptionId}, Resource Group: ${resourceGroupName} App Service:${webAppName} Vault Name: ${vaultName} Secret Name: ${secretName} Email: ${email}`
    );

    const creds = new TokenCredentials(accessToken);

    const keyVault = createKeyVaultHelper(creds, subscriptionId);

    await keyVault.updateWebAppIdentity(resourceGroupName, webAppName);

    const principalId = await keyVault.getWebAppIdentity(resourceGroupName, webAppName);
    onProgress(202, `Found web app. Principal ID: ${principalId}`);

    const tenantId = await getTenantId(accessToken, subscriptionId);
    await keyVault.setKeyVaultPolicy(resourceGroupName, vaultName, email, principalId, tenantId);

    onProgress(202, `Getting secret...`);

    const secretUri = await keyVault.getWebAppSecretUri(resourceGroupName, vaultName, secretName);

    // const secret = await keyVaultApi.KeyVaultGetSecretValue(resourceGroupName, vaultName, secretName);

    onProgress(202, `Found secret. Uri: ${secretUri}`);
    await keyVault.updateWebAppSecretUri(resourceGroupName, webAppName, secretUri);

    // await keyVaultApi.UpdateKeyVaultValueAppSettings(resourceGroupName, webAppName, secret);
  };

  return { execute };
};
