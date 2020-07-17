import * as msRest from "@azure/ms-rest-js";
import * as msRestAzure from "@azure/ms-rest-azure-js";
import * as Models from "../models";
import { AzureBotServiceContext } from "../azureBotServiceContext";
/** Class representing a EnterpriseChannels. */
export declare class EnterpriseChannels {
    private readonly client;
    /**
     * Create a EnterpriseChannels.
     * @param {AzureBotServiceContext} client Reference to the service client.
     */
    constructor(client: AzureBotServiceContext);
    /**
     * Check whether an Enterprise Channel name is available.
     * @param parameters The parameters to provide for the Enterprise Channel check name availability
     * request.
     * @param [options] The optional parameters
     * @returns Promise<Models.EnterpriseChannelsCheckNameAvailabilityResponse>
     */
    checkNameAvailability(parameters: Models.EnterpriseChannelCheckNameAvailabilityRequest, options?: msRest.RequestOptionsBase): Promise<Models.EnterpriseChannelsCheckNameAvailabilityResponse>;
    /**
     * @param parameters The parameters to provide for the Enterprise Channel check name availability
     * request.
     * @param callback The callback
     */
    checkNameAvailability(parameters: Models.EnterpriseChannelCheckNameAvailabilityRequest, callback: msRest.ServiceCallback<Models.EnterpriseChannelCheckNameAvailabilityResponse>): void;
    /**
     * @param parameters The parameters to provide for the Enterprise Channel check name availability
     * request.
     * @param options The optional parameters
     * @param callback The callback
     */
    checkNameAvailability(parameters: Models.EnterpriseChannelCheckNameAvailabilityRequest, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.EnterpriseChannelCheckNameAvailabilityResponse>): void;
    /**
     * Returns all the resources of a particular type belonging to a resource group.
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param [options] The optional parameters
     * @returns Promise<Models.EnterpriseChannelsListByResourceGroupResponse>
     */
    listByResourceGroup(resourceGroupName: string, options?: msRest.RequestOptionsBase): Promise<Models.EnterpriseChannelsListByResourceGroupResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param callback The callback
     */
    listByResourceGroup(resourceGroupName: string, callback: msRest.ServiceCallback<Models.EnterpriseChannelResponseList>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param options The optional parameters
     * @param callback The callback
     */
    listByResourceGroup(resourceGroupName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.EnterpriseChannelResponseList>): void;
    /**
     * Creates an Enterprise Channel.
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param parameters The parameters to provide for the new Enterprise Channel.
     * @param [options] The optional parameters
     * @returns Promise<Models.EnterpriseChannelsCreateResponse>
     */
    create(resourceGroupName: string, resourceName: string, parameters: Models.EnterpriseChannel, options?: msRest.RequestOptionsBase): Promise<Models.EnterpriseChannelsCreateResponse>;
    /**
     * Updates an Enterprise Channel.
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.EnterpriseChannelsUpdateResponse>
     */
    update(resourceGroupName: string, resourceName: string, options?: Models.EnterpriseChannelsUpdateOptionalParams): Promise<Models.EnterpriseChannelsUpdateResponse>;
    /**
     * Deletes an Enterprise Channel from the resource group
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param [options] The optional parameters
     * @returns Promise<msRest.RestResponse>
     */
    deleteMethod(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<msRest.RestResponse>;
    /**
     * Returns an Enterprise Channel specified by the parameters.
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.EnterpriseChannelsGetResponse>
     */
    get(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<Models.EnterpriseChannelsGetResponse>;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<Models.EnterpriseChannel>): void;
    /**
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.EnterpriseChannel>): void;
    /**
     * Creates an Enterprise Channel.
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param parameters The parameters to provide for the new Enterprise Channel.
     * @param [options] The optional parameters
     * @returns Promise<msRestAzure.LROPoller>
     */
    beginCreate(resourceGroupName: string, resourceName: string, parameters: Models.EnterpriseChannel, options?: msRest.RequestOptionsBase): Promise<msRestAzure.LROPoller>;
    /**
     * Updates an Enterprise Channel.
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param [options] The optional parameters
     * @returns Promise<msRestAzure.LROPoller>
     */
    beginUpdate(resourceGroupName: string, resourceName: string, options?: Models.EnterpriseChannelsBeginUpdateOptionalParams): Promise<msRestAzure.LROPoller>;
    /**
     * Deletes an Enterprise Channel from the resource group
     * @param resourceGroupName The name of the Bot resource group in the user subscription.
     * @param resourceName The name of the Bot resource.
     * @param [options] The optional parameters
     * @returns Promise<msRestAzure.LROPoller>
     */
    beginDeleteMethod(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<msRestAzure.LROPoller>;
    /**
     * Returns all the resources of a particular type belonging to a resource group.
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param [options] The optional parameters
     * @returns Promise<Models.EnterpriseChannelsListByResourceGroupNextResponse>
     */
    listByResourceGroupNext(nextPageLink: string, options?: msRest.RequestOptionsBase): Promise<Models.EnterpriseChannelsListByResourceGroupNextResponse>;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param callback The callback
     */
    listByResourceGroupNext(nextPageLink: string, callback: msRest.ServiceCallback<Models.EnterpriseChannelResponseList>): void;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param options The optional parameters
     * @param callback The callback
     */
    listByResourceGroupNext(nextPageLink: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.EnterpriseChannelResponseList>): void;
}
//# sourceMappingURL=enterpriseChannels.d.ts.map