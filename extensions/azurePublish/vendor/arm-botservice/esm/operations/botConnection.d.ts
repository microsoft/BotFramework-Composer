import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { AzureBotServiceContext } from "../azureBotServiceContext";
/** Class representing a BotConnection. */
export declare class BotConnection {
    private readonly client;
    /**
     * Create a BotConnection.
     * @param {AzureBotServiceContext} client Reference to the service client.
     */
    constructor(client: AzureBotServiceContext);
    /**
     * Lists the available Service Providers for creating Connection Settings
     * @param [options] The optional parameters
     * @returns Promise<Models.BotConnectionListServiceProvidersResponse>
     */
    listServiceProviders(options?: msRest.RequestOptionsBase): Promise<Models.BotConnectionListServiceProvidersResponse>;
    /**
     * @param callback The callback
     */
    listServiceProviders(callback: msRest.ServiceCallback<Models.ServiceProviderResponseList>): void;
    /**
     * @param options The optional parameters
     * @param callback The callback
     */
    listServiceProviders(options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ServiceProviderResponseList>): void;
    /**
     * Get a Connection Setting registration for a Bot Service
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param connectionName The name of the Bot Service Connection Setting resource
     * @param [options] The optional parameters
     * @returns Promise<Models.BotConnectionListWithSecretsResponse>
     */
    listWithSecrets(resourceGroupName: string, resourceName: string, connectionName: string, options?: msRest.RequestOptionsBase): Promise<Models.BotConnectionListWithSecretsResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param connectionName The name of the Bot Service Connection Setting resource
     * @param callback The callback
     */
    listWithSecrets(resourceGroupName: string, resourceName: string, connectionName: string, callback: msRest.ServiceCallback<Models.ConnectionSetting>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param connectionName The name of the Bot Service Connection Setting resource
     * @param options The optional parameters
     * @param callback The callback
     */
    listWithSecrets(resourceGroupName: string, resourceName: string, connectionName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ConnectionSetting>): void;
    /**
     * Register a new Auth Connection for a Bot Service
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param connectionName The name of the Bot Service Connection Setting resource
     * @param parameters The parameters to provide for creating the Connection Setting.
     * @param [options] The optional parameters
     * @returns Promise<Models.BotConnectionCreateResponse>
     */
    create(resourceGroupName: string, resourceName: string, connectionName: string, parameters: Models.ConnectionSetting, options?: msRest.RequestOptionsBase): Promise<Models.BotConnectionCreateResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param connectionName The name of the Bot Service Connection Setting resource
     * @param parameters The parameters to provide for creating the Connection Setting.
     * @param callback The callback
     */
    create(resourceGroupName: string, resourceName: string, connectionName: string, parameters: Models.ConnectionSetting, callback: msRest.ServiceCallback<Models.ConnectionSetting>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param connectionName The name of the Bot Service Connection Setting resource
     * @param parameters The parameters to provide for creating the Connection Setting.
     * @param options The optional parameters
     * @param callback The callback
     */
    create(resourceGroupName: string, resourceName: string, connectionName: string, parameters: Models.ConnectionSetting, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ConnectionSetting>): void;
    /**
     * Updates a Connection Setting registration for a Bot Service
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param connectionName The name of the Bot Service Connection Setting resource
     * @param parameters The parameters to provide for updating the Connection Setting.
     * @param [options] The optional parameters
     * @returns Promise<Models.BotConnectionUpdateResponse>
     */
    update(resourceGroupName: string, resourceName: string, connectionName: string, parameters: Models.ConnectionSetting, options?: msRest.RequestOptionsBase): Promise<Models.BotConnectionUpdateResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param connectionName The name of the Bot Service Connection Setting resource
     * @param parameters The parameters to provide for updating the Connection Setting.
     * @param callback The callback
     */
    update(resourceGroupName: string, resourceName: string, connectionName: string, parameters: Models.ConnectionSetting, callback: msRest.ServiceCallback<Models.ConnectionSetting>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param connectionName The name of the Bot Service Connection Setting resource
     * @param parameters The parameters to provide for updating the Connection Setting.
     * @param options The optional parameters
     * @param callback The callback
     */
    update(resourceGroupName: string, resourceName: string, connectionName: string, parameters: Models.ConnectionSetting, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ConnectionSetting>): void;
    /**
     * Get a Connection Setting registration for a Bot Service
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param connectionName The name of the Bot Service Connection Setting resource
     * @param [options] The optional parameters
     * @returns Promise<Models.BotConnectionGetResponse>
     */
    get(resourceGroupName: string, resourceName: string, connectionName: string, options?: msRest.RequestOptionsBase): Promise<Models.BotConnectionGetResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param connectionName The name of the Bot Service Connection Setting resource
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, connectionName: string, callback: msRest.ServiceCallback<Models.ConnectionSetting>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param connectionName The name of the Bot Service Connection Setting resource
     * @param options The optional parameters
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, connectionName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ConnectionSetting>): void;
    /**
     * Deletes a Connection Setting registration for a Bot Service
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param connectionName The name of the Bot Service Connection Setting resource
     * @param [options] The optional parameters
     * @returns Promise<msRest.RestResponse>
     */
    deleteMethod(resourceGroupName: string, resourceName: string, connectionName: string, options?: msRest.RequestOptionsBase): Promise<msRest.RestResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param connectionName The name of the Bot Service Connection Setting resource
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, connectionName: string, callback: msRest.ServiceCallback<void>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param connectionName The name of the Bot Service Connection Setting resource
     * @param options The optional parameters
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, connectionName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<void>): void;
    /**
     * Returns all the Connection Settings registered to a particular BotService resource
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.BotConnectionListByBotServiceResponse>
     */
    listByBotService(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<Models.BotConnectionListByBotServiceResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param callback The callback
     */
    listByBotService(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<Models.ConnectionSettingResponseList>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    listByBotService(resourceGroupName: string, resourceName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ConnectionSettingResponseList>): void;
    /**
     * Returns all the Connection Settings registered to a particular BotService resource
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param [options] The optional parameters
     * @returns Promise<Models.BotConnectionListByBotServiceNextResponse>
     */
    listByBotServiceNext(nextPageLink: string, options?: msRest.RequestOptionsBase): Promise<Models.BotConnectionListByBotServiceNextResponse>;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param callback The callback
     */
    listByBotServiceNext(nextPageLink: string, callback: msRest.ServiceCallback<Models.ConnectionSettingResponseList>): void;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param options The optional parameters
     * @param callback The callback
     */
    listByBotServiceNext(nextPageLink: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ConnectionSettingResponseList>): void;
}
//# sourceMappingURL=botConnection.d.ts.map