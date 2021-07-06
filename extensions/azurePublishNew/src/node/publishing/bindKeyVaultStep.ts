// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { TokenCredentials } from '@azure/ms-rest-js';

import { createKeyVaultHelper } from './utils/keyVaultUtils';
import { OnPublishProgress } from './types';
import { getTenantId } from './utils/authUtils';

type StepConfig = {
  accessToken: string;
  appPasswordHint: string;
  email: string;
  hostname: string;
};

export const bindToKeyVaultStep = async (config: StepConfig, onProgress: OnPublishProgress): Promise<void> => {
  const { accessToken, appPasswordHint, email, hostname } = config;

  if (!appPasswordHint || !hostname) {
    onProgress(400, 'Skipped binding to key vault. Missing settings.');
    return;
  }

  const webAppName = hostname;
  const resourceGroupName = appPasswordHint.match(/resourceGroups\/([^/]*)/)[1];
  const secretName = appPasswordHint.match(/secrets\/([^/]*)/)[1];
  const subscriptionId = appPasswordHint.match(/subscriptions\/([\w-]*)\//)[1];
  const vaultName = appPasswordHint.match(/vaults\/([^/]*)/)[1];

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
