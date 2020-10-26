import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { AzureBotServiceContext } from "../azureBotServiceContext";
/** Class representing a Bots. */
export declare class Bots {
    private readonly client;
    /**
     * Create a Bots.
     * @param {AzureBotServiceContext} client Reference to the service client.
     */
    constructor(client: AzureBotServiceContext);
    /**
     * Creates a Bot Service. Bot Service is a resource group wide resource type.
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param parameters The parameters to provide for the created bot.
     * @param [options] The optional parameters
     * @returns Promise<Models.BotsCreateResponse>
     */
    create(resourceGroupName: string, resourceName: string, parameters: Models.Bot, options?: msRest.RequestOptionsBase): Promise<Models.BotsCreateResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param parameters The parameters to provide for the created bot.
     * @param callback The callback
     */
    create(resourceGroupName: string, resourceName: string, parameters: Models.Bot, callback: msRest.ServiceCallback<Models.Bot>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param parameters The parameters to provide for the created bot.
     * @param options The optional parameters
     * @param callback The callback
     */
    create(resourceGroupName: string, resourceName: string, parameters: Models.Bot, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.Bot>): void;
    /**
     * Updates a Bot Service
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.BotsUpdateResponse>
     */
    update(resourceGroupName: string, resourceName: string, options?: Models.BotsUpdateOptionalParams): Promise<Models.BotsUpdateResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param callback The callback
     */
    update(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<Models.Bot>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    update(resourceGroupName: string, resourceName: string, options: Models.BotsUpdateOptionalParams, callback: msRest.ServiceCallback<Models.Bot>): void;
    /**
     * Deletes a Bot Service from the resource group.
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param [options] The optional parameters
     * @returns Promise<msRest.RestResponse>
     */
    deleteMethod(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<msRest.RestResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<void>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<void>): void;
    /**
     * Returns a BotService specified by the parameters.
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.BotsGetResponse>
     */
    get(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<Models.BotsGetResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<Models.Bot>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.Bot>): void;
    /**
     * Returns all the resources of a particular type belonging to a resource group
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param [options] The optional parameters
     * @returns Promise<Models.BotsListByResourceGroupResponse>
     */
    listByResourceGroup(resourceGroupName: string, options?: msRest.RequestOptionsBase): Promise<Models.BotsListByResourceGroupResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param callback The callback
     */
    listByResourceGroup(resourceGroupName: string, callback: msRest.ServiceCallback<Models.BotResponseList>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param options The optional parameters
     * @param callback The callback
     */
    listByResourceGroup(resourceGroupName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.BotResponseList>): void;
    /**
     * Returns all the resources of a particular type belonging to a subscription.
     * @param [options] The optional parameters
     * @returns Promise<Models.BotsListResponse>
     */
    list(options?: msRest.RequestOptionsBase): Promise<Models.BotsListResponse>;
    /**
     * @param callback The callback
     */
    list(callback: msRest.ServiceCallback<Models.BotResponseList>): void;
    /**
     * @param options The optional parameters
     * @param callback The callback
     */
    list(options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.BotResponseList>): void;
    /**
     * Check whether a bot name is available.
     * @param parameters The request body parameters to provide for the check name availability request
     * @param [options] The optional parameters
     * @returns Promise<Models.BotsGetCheckNameAvailabilityResponse>
     */
    getCheckNameAvailability(parameters: Models.CheckNameAvailabilityRequestBody, options?: msRest.RequestOptionsBase): Promise<Models.BotsGetCheckNameAvailabilityResponse>;
    /**
     * @param parameters The request body parameters to provide for the check name availability request
     * @param callback The callback
     */
    getCheckNameAvailability(parameters: Models.CheckNameAvailabilityRequestBody, callback: msRest.ServiceCallback<Models.CheckNameAvailabilityResponseBody>): void;
    /**
     * @param parameters The request body parameters to provide for the check name availability request
     * @param options The optional parameters
     * @param callback The callback
     */
    getCheckNameAvailability(parameters: Models.CheckNameAvailabilityRequestBody, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.CheckNameAvailabilityResponseBody>): void;
    /**
     * Returns all the resources of a particular type belonging to a resource group
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param [options] The optional parameters
     * @returns Promise<Models.BotsListByResourceGroupNextResponse>
     */
    listByResourceGroupNext(nextPageLink: string, options?: msRest.RequestOptionsBase): Promise<Models.BotsListByResourceGroupNextResponse>;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param callback The callback
     */
    listByResourceGroupNext(nextPageLink: string, callback: msRest.ServiceCallback<Models.BotResponseList>): void;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param options The optional parameters
     * @param callback The callback
     */
    listByResourceGroupNext(nextPageLink: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.BotResponseList>): void;
    /**
     * Returns all the resources of a particular type belonging to a subscription.
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param [options] The optional parameters
     * @returns Promise<Models.BotsListNextResponse>
     */
    listNext(nextPageLink: string, options?: msRest.RequestOptionsBase): Promise<Models.BotsListNextResponse>;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param callback The callback
     */
    listNext(nextPageLink: string, callback: msRest.ServiceCallback<Models.BotResponseList>): void;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param options The optional parameters
     * @param callback The callback
     */
    listNext(nextPageLink: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.BotResponseList>): void;
}
//# sourceMappingURL=bots.d.ts.map