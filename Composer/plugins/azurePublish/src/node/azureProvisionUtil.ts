// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SubscriptionClient } from '@azure/arm-subscriptions';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { ResourceManagementClient } from '@azure/arm-resources';
import { ResourceGroup, GenericResource } from '@azure/arm-resources/esm/models';
import { AzureBotService } from '@azure/arm-botservice';
import { WebSiteManagementClient } from '@azure/arm-appservice';
import { ResourceNameAvailability } from '@azure/arm-appservice/esm/models';
import { CheckNameAvailabilityResponseBody } from '@azure/arm-botservice/esm/models';

export enum AzureAPIStatus {
    INFO = 'INFO',
    PARAM_ERROR = 'PARAM_ERROR',
    ERROR = "ERROR"
}

export enum AzureResourceProviderType {
    QnA = 'Microsoft.CognitiveServices',
    Luis = 'Microsoft.CognitiveServices',
    CosmosDB = 'Microsoft.DocumentDB',
    BlobStorage = 'Microsoft.Storage',
    ApplicationInsights = 'Microsoft.Insights',
    WebApp = 'Microsoft.Web',
    Bot = 'Microsoft.BotService',
}

export class AzureProvisionUtil {

    /**
     * credentials from azure login
     */
    private credentials: any;

    /**
     * customized injected logger
     */
    private logger: any;

    constructor(credentials: any) {
        this.credentials = credentials;
    }

    /**
     * GetUserSubscriptions based on the credentials of users
     */
    public async GetUserSubscriptions(): Promise<Array<Subscription>> {
        try {
            const subscriptionClient = new SubscriptionClient(this.credentials);
            const subscriptionsResult = await subscriptionClient.subscriptions.list();
            if (subscriptionsResult._response.status >= 300) {
                this.logger({
                    status: AzureAPIStatus.ERROR,
                    message: subscriptionsResult._response.bodyAsText
                });
                return []
            }
            return subscriptionsResult._response.parsedBody;
        }
        catch (err) {
            this.logger({
                status: AzureAPIStatus.ERROR,
                message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
            });
            return []
        }
    }

    /**
     * Get supported regions for differernt resource type
     */
    public async GetSupportedRegionsByType(subscriptionId: string, resourceType: AzureResourceProviderType): Promise<Array<string>> {
        try {
            if (!subscriptionId) {
                this.logger({
                    status: AzureAPIStatus.PARAM_ERROR,
                    message: 'Need subscription or subscription id as a parameter.'
                });
                return []
            }

            if (!resourceType) {
                this.logger({
                    status: AzureAPIStatus.PARAM_ERROR,
                    message: 'Need resourceType or as a parameter.'
                });
                return []
            }
            const resourceManagementClient = new ResourceManagementClient(this.credentials, subscriptionId);
            const resourceProviderResult = await resourceManagementClient.providers.get(resourceType);
            if (resourceProviderResult._response.status >= 300) {
                this.logger({
                    status: AzureAPIStatus.ERROR,
                    message: resourceProviderResult._response.bodyAsText
                });
                return []
            }
            const resourceTypes = resourceProviderResult._response.parsedBody.resourceTypes;
            if (resourceTypes.length == 0) {
                return []
            }
            return resourceTypes[0].locations;
        }
        catch (err) {
            this.logger({
                status: AzureAPIStatus.ERROR,
                message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
            });
            return []
        }
    }

    /**
     * Get all resource groups under a subscription
     */
    public async GetResourceGroupBySubscription(subscriptionId: string): Promise<Array<ResourceGroup>> {
        try {
            if (subscriptionId) {
                this.logger({
                    status: AzureAPIStatus.PARAM_ERROR,
                    message: 'Need subscription or subscription id as a parameter.'
                });
                return []
            }
            const resourceManagementClient = new ResourceManagementClient(this.credentials, subscriptionId);
            const resourceGroupsResult = await resourceManagementClient.resourceGroups.list();
            if (resourceGroupsResult._response.status >= 300) {
                this.logger({
                    status: AzureAPIStatus.ERROR,
                    message: resourceGroupsResult._response.bodyAsText
                });
                return []
            }
            return resourceGroupsResult._response.parsedBody;
        }
        catch (err) {
            this.logger({
                status: AzureAPIStatus.ERROR,
                message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
            });
            return []
        }
    }

    /**
     * Get all resource groups under a subscription id
     */
    public async GetResourceGroupBySubscriptionId(subscriptionId: string): Promise<Array<ResourceGroup>> {
        try {
            if (!subscriptionId) {
                this.logger({
                    status: AzureAPIStatus.PARAM_ERROR,
                    message: 'Need subscription or subscription id as a parameter.'
                });
                return []
            }
            const resourceManagementClient = new ResourceManagementClient(this.credentials, subscriptionId);
            const resourceGroupsResult = await resourceManagementClient.resourceGroups.list();
            if (resourceGroupsResult._response.status >= 300) {
                this.logger({
                    status: AzureAPIStatus.ERROR,
                    message: resourceGroupsResult._response.bodyAsText
                });
                return []
            }
            return resourceGroupsResult._response.parsedBody;
        }
        catch (err) {
            this.logger({
                status: AzureAPIStatus.ERROR,
                message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
            });
            return []
        }
    }

    /**
     * Check bot channel registration name availability
     */
    public async CheckBotNameAvailability(botName: string, subscriptionId: string): Promise<CheckNameAvailabilityResponseBody> {
        try {
            if (!botName) {
                this.logger({
                    status: AzureAPIStatus.PARAM_ERROR,
                    message: 'Need bot name as a parameter.'
                });
                return {
                    valid: false,
                    message: 'Invalid param: bot name'
                } as CheckNameAvailabilityResponseBody;
            }
            if (!subscriptionId) {
                this.logger({
                    status: AzureAPIStatus.PARAM_ERROR,
                    message: 'Need subscription id as a parameter.'
                });
                return {
                    valid: false,
                    message: 'Invalid param: subscription id'
                } as CheckNameAvailabilityResponseBody;
            }

            const azureBotService = new AzureBotService(this.credentials, subscriptionId);
            const getCheckNameAvailabilityResult = await azureBotService.bots.getCheckNameAvailability({
                name: botName,
                type: 'bot'
            });
            if (getCheckNameAvailabilityResult._response.status >= 300) {
                this.logger({
                    status: AzureAPIStatus.ERROR,
                    message: getCheckNameAvailabilityResult._response.bodyAsText
                });
                return {
                    valid: false,
                    message: `Invalid request: ${getCheckNameAvailabilityResult._response.bodyAsText}`
                } as CheckNameAvailabilityResponseBody;
            }
            return getCheckNameAvailabilityResult._response.parsedBody;
        }
        catch (err) {
            this.logger({
                status: AzureAPIStatus.ERROR,
                message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
            });
            return {
                valid: false,
                message: JSON.stringify(err, Object.getOwnPropertyNames(err))
            } as CheckNameAvailabilityResponseBody;
        }
    }

    /**
     * Check the web app name availability
     */
    public async CheckWebAppNameAvailability(webAppName: string, subscriptionId: string): Promise<ResourceNameAvailability> {
        try {
            if (!webAppName) {
                this.logger({
                    status: AzureAPIStatus.PARAM_ERROR,
                    message: 'Need webapp name as a parameter.'
                });
                return {
                    nameAvailable: false,
                    message: 'Invalid param: webapp name'
                } as ResourceNameAvailability;
            }
            if (!subscriptionId) {
                this.logger({
                    status: AzureAPIStatus.PARAM_ERROR,
                    message: 'Need subscription id as a parameter.'
                });
                return {
                    nameAvailable: false,
                    message: 'Invalid param: subscription id'
                } as ResourceNameAvailability;
            }

            const webSiteManagementClient = new WebSiteManagementClient(this.credentials, subscriptionId);
            const getCheckNameAvailabilityResult = await webSiteManagementClient.checkNameAvailability(name, 'Microsoft.Web/sites');
            if (getCheckNameAvailabilityResult._response.status >= 300) {
                this.logger({
                    status: AzureAPIStatus.ERROR,
                    message: getCheckNameAvailabilityResult._response.bodyAsText
                });
                return {
                    nameAvailable: false,
                    message: `Invalid request: ${getCheckNameAvailabilityResult._response.bodyAsText}`
                } as ResourceNameAvailability;
            }
            return getCheckNameAvailabilityResult._response.parsedBody;
        }
        catch (err) {
            this.logger({
                status: AzureAPIStatus.ERROR,
                message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
            });
            return {
                nameAvailable: false,
                message: JSON.stringify(err, Object.getOwnPropertyNames(err))
            } as ResourceNameAvailability;
        }
    }

    /**
     * Get all resources under a resource group
     */
    public async GetAllResourcesInResourceGroup(resourceGroupName: string, subscriptionId: string): Promise<Array<GenericResource>> {
        try {
            if (!subscriptionId) {
                this.logger({
                    status: AzureAPIStatus.PARAM_ERROR,
                    message: 'Need subscription or subscription id as a parameter.'
                });
                return []
            }
            if (!resourceGroupName) {
                this.logger({
                    status: AzureAPIStatus.PARAM_ERROR,
                    message: 'Need resource group name as a parameter.'
                });
                return []
            }
            const resourceManagementClient = new ResourceManagementClient(this.credentials, subscriptionId);
            const listByResourceGroupResult = await resourceManagementClient.resources.listByResourceGroup(resourceGroupName);
            if (listByResourceGroupResult._response.status >= 300) {
                this.logger({
                    status: AzureAPIStatus.ERROR,
                    message: listByResourceGroupResult._response.bodyAsText
                });
                return []
            }
            return listByResourceGroupResult._response.parsedBody;
        }
        catch (err) {
            this.logger({
                status: AzureAPIStatus.ERROR,
                message: JSON.stringify(err, Object.getOwnPropertyNames(err)),
            });
            return []
        }
    }
}