// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { KeyVaultManagementClient } from '@azure/arm-keyvault-profile-2020-09-01-hybrid';
import { TokenCredentials } from '@azure/ms-rest-js';
import { WebSiteManagementClient } from '@azure/arm-appservice';

export const createKeyVaultHelper = (creds: TokenCredentials, subscriptionId: string) => {
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
