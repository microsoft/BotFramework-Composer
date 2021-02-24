// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { KeyVaultApiConfig } from "./keyvaultApiConfig";
import { WebSiteManagementClient } from '@azure/arm-appservice';
import { BotProjectDeployLoggerType } from "../types";
import { createCustomizeError, ProvisionErrors } from "../utils/errorHandler";
import { KeyVaultManagementClient } from "@azure/arm-keyvault-profile-2020-09-01-hybrid";
import { SecretClient } from "@azure/keyvault-secrets";

export class KeyVaultApi {
    private creds: any;
    private subscriptionId: string;
    private logger: any;

    constructor(config: KeyVaultApiConfig) {
        this.creds = config.creds;
        this.subscriptionId = config.subscriptionId;
        this.logger = config.logger;
    }

    public async WebAppAssignIdentity(resourceGroupName: string, webAppName: string) {
        const webSiteManagementClient = new WebSiteManagementClient(this.creds, this.subscriptionId);
        const updateResult = await webSiteManagementClient.webApps.update(resourceGroupName, webAppName, {
            identity: {
                type: 'SystemAssigned'
            }
        });
        if (updateResult._response.status >= 300) {
            this.logger({
                status: BotProjectDeployLoggerType.PROVISION_ERROR,
                message: updateResult._response.bodyAsText,
            });
            throw createCustomizeError(ProvisionErrors.KEYVAULT_ERROR, updateResult._response.bodyAsText);
        }
    }

    public async WebAppIdentityShow(resourceGroupName: string, webAppName: string) {
        const webSiteManagementClient = new WebSiteManagementClient(this.creds, this.subscriptionId);
        const getResult = await webSiteManagementClient.webApps.get(resourceGroupName, webAppName);
        if (getResult._response.status >= 300) {
            this.logger({
                status: BotProjectDeployLoggerType.PROVISION_ERROR,
                message: getResult._response.bodyAsText,
            });
            throw createCustomizeError(ProvisionErrors.KEYVAULT_ERROR, getResult._response.bodyAsText);
        }
        return getResult._response.parsedBody.identity.principalId;
    }

    public async KeyVaultSetPolicy(resourceGroupName: string, vaultName: string, email: string, objectId: string, tenantId: string) {
        const keyVaultManagementClient = new KeyVaultManagementClient(this.creds, this.subscriptionId);
        const setResult = await keyVaultManagementClient.vaults.update(resourceGroupName, vaultName, {
            properties: {
                accessPolicies: [
                    {
                        objectId: objectId,
                        permissions: {
                            secrets: ['get', 'list']
                        },
                        tenantId: tenantId
                    }
                ]
            }
        });
        if (setResult._response.status >= 300) {
            this.logger({
                status: BotProjectDeployLoggerType.PROVISION_ERROR,
                message: setResult._response.bodyAsText,
            });
            throw createCustomizeError(ProvisionErrors.KEYVAULT_ERROR, setResult._response.bodyAsText);
        }
    }

    public async KeyVaultGetSecret(resourceGroupName: string, vaultName: string, secretName: string) {
        // const vaultUrl = `https://${vaultName}.vault.azure.net/`;
        // const keyVaultClient = new SecretClient(vaultUrl, this.creds);
        // const getResult = await keyVaultClient.getSecret(secretName);
        // return getResult.properties.id;
        const keyVaultManagementClient = new KeyVaultManagementClient(this.creds, this.subscriptionId);
        const secretResult = await keyVaultManagementClient.secrets.get(resourceGroupName, vaultName, secretName);
        if (secretResult._response.status >= 300) {
            this.logger({
                status: BotProjectDeployLoggerType.PROVISION_ERROR,
                message: secretResult._response.bodyAsText,
            });
            throw createCustomizeError(ProvisionErrors.KEYVAULT_ERROR, secretResult._response.bodyAsText);
        }
        console.log(JSON.stringify(secretResult._response.parsedBody, null, 2));
        return secretResult._response.parsedBody.properties.secretUri;
    }

    public async KeyVaultGetSecretValue(resourceGroupName: string, vaultName: string, secretName: string) {
        // const vaultUrl = `https://${vaultName}.vault.azure.net/`;
        // const keyVaultClient = new SecretClient(vaultUrl, this.creds);
        // const getResult = await keyVaultClient.getSecret(secretName);
        // this.logger({
        //     status: BotProjectDeployLoggerType.DEPLOY_INFO,
        //     message: JSON.stringify(getResult)
        // })
        // return getResult.value;
        const keyVaultManagementClient = new KeyVaultManagementClient(this.creds, this.subscriptionId);
        const secretResult = await keyVaultManagementClient.secrets.get(resourceGroupName, vaultName, secretName);
        if (secretResult._response.status >= 300) {
            this.logger({
                status: BotProjectDeployLoggerType.PROVISION_ERROR,
                message: secretResult._response.bodyAsText,
            });
            throw createCustomizeError(ProvisionErrors.KEYVAULT_ERROR, secretResult._response.bodyAsText);
        }
        console.log(JSON.stringify(secretResult._response.parsedBody, null, 2));
        return secretResult._response.parsedBody.properties.value;
    }

    public async UpdateKeyVaultAppSettings(resourceGroupName: string, webAppName: string, secretUri: string) {
        const webSiteManagementClient = new WebSiteManagementClient(this.creds, this.subscriptionId);
        const updateResult = await webSiteManagementClient.webApps.updateApplicationSettings(resourceGroupName, webAppName, {
            properties: {
                MicrosoftAppPassword: `@Microsoft.KeyVault(SecretUri=${secretUri})`
            }
        });
        if (updateResult._response.status >= 300) {
            this.logger({
                status: BotProjectDeployLoggerType.PROVISION_ERROR,
                message: updateResult._response.bodyAsText,
            });
            throw createCustomizeError(ProvisionErrors.KEYVAULT_ERROR, updateResult._response.bodyAsText);
        }
    }

    public async UpdateKeyVaultValueAppSettings(resourceGroupName: string, webAppName: string, secretValue: string) {
        const webSiteManagementClient = new WebSiteManagementClient(this.creds, this.subscriptionId);
        const updateResult = await webSiteManagementClient.webApps.updateApplicationSettings(resourceGroupName, webAppName, {
            properties: {
                MicrosoftAppPassword: secretValue
            }
        });
        if (updateResult._response.status >= 300) {
            this.logger({
                status: BotProjectDeployLoggerType.PROVISION_ERROR,
                message: updateResult._response.bodyAsText,
            });
            throw createCustomizeError(ProvisionErrors.KEYVAULT_ERROR, updateResult._response.bodyAsText);
        }
    }
}
