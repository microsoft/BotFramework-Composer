import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { ApplicationInsightsManagementClientContext } from "../applicationInsightsManagementClientContext";
/** Class representing a Components. */
export declare class Components {
    private readonly client;
    /**
     * Create a Components.
     * @param {ApplicationInsightsManagementClientContext} client Reference to the service client.
     */
    constructor(client: ApplicationInsightsManagementClientContext);
    /**
     * Gets a list of all Application Insights components within a subscription.
     * @param [options] The optional parameters
     * @returns Promise<Models.ComponentsListResponse>
     */
    list(options?: msRest.RequestOptionsBase): Promise<Models.ComponentsListResponse>;
    /**
     * @param callback The callback
     */
    list(callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentListResult>): void;
    /**
     * @param options The optional parameters
     * @param callback The callback
     */
    list(options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentListResult>): void;
    /**
     * Gets a list of Application Insights components within a resource group.
     * @param resourceGroupName The name of the resource group.
     * @param [options] The optional parameters
     * @returns Promise<Models.ComponentsListByResourceGroupResponse>
     */
    listByResourceGroup(resourceGroupName: string, options?: msRest.RequestOptionsBase): Promise<Models.ComponentsListByResourceGroupResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param callback The callback
     */
    listByResourceGroup(resourceGroupName: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentListResult>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param options The optional parameters
     * @param callback The callback
     */
    listByResourceGroup(resourceGroupName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentListResult>): void;
    /**
     * Deletes an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param [options] The optional parameters
     * @returns Promise<msRest.RestResponse>
     */
    deleteMethod(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<msRest.RestResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<void>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<void>): void;
    /**
     * Returns an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.ComponentsGetResponse>
     */
    get(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<Models.ComponentsGetResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponent>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponent>): void;
    /**
     * Creates (or updates) an Application Insights component. Note: You cannot specify a different
     * value for InstrumentationKey nor AppId in the Put operation.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param insightProperties Properties that need to be specified to create an Application Insights
     * component.
     * @param [options] The optional parameters
     * @returns Promise<Models.ComponentsCreateOrUpdateResponse>
     */
    createOrUpdate(resourceGroupName: string, resourceName: string, insightProperties: Models.ApplicationInsightsComponent, options?: msRest.RequestOptionsBase): Promise<Models.ComponentsCreateOrUpdateResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param insightProperties Properties that need to be specified to create an Application Insights
     * component.
     * @param callback The callback
     */
    createOrUpdate(resourceGroupName: string, resourceName: string, insightProperties: Models.ApplicationInsightsComponent, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponent>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param insightProperties Properties that need to be specified to create an Application Insights
     * component.
     * @param options The optional parameters
     * @param callback The callback
     */
    createOrUpdate(resourceGroupName: string, resourceName: string, insightProperties: Models.ApplicationInsightsComponent, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponent>): void;
    /**
     * Updates an existing component's tags. To update other fields use the CreateOrUpdate method.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param componentTags Updated tag information to set into the component instance.
     * @param [options] The optional parameters
     * @returns Promise<Models.ComponentsUpdateTagsResponse>
     */
    updateTags(resourceGroupName: string, resourceName: string, componentTags: Models.TagsResource, options?: msRest.RequestOptionsBase): Promise<Models.ComponentsUpdateTagsResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param componentTags Updated tag information to set into the component instance.
     * @param callback The callback
     */
    updateTags(resourceGroupName: string, resourceName: string, componentTags: Models.TagsResource, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponent>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param componentTags Updated tag information to set into the component instance.
     * @param options The optional parameters
     * @param callback The callback
     */
    updateTags(resourceGroupName: string, resourceName: string, componentTags: Models.TagsResource, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponent>): void;
    /**
     * Purges data in an Application Insights component by a set of user-defined filters.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param body Describes the body of a request to purge data in a single table of an Application
     * Insights component
     * @param [options] The optional parameters
     * @returns Promise<Models.ComponentsPurgeResponse>
     */
    purge(resourceGroupName: string, resourceName: string, body: Models.ComponentPurgeBody, options?: msRest.RequestOptionsBase): Promise<Models.ComponentsPurgeResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param body Describes the body of a request to purge data in a single table of an Application
     * Insights component
     * @param callback The callback
     */
    purge(resourceGroupName: string, resourceName: string, body: Models.ComponentPurgeBody, callback: msRest.ServiceCallback<Models.ComponentPurgeResponse>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param body Describes the body of a request to purge data in a single table of an Application
     * Insights component
     * @param options The optional parameters
     * @param callback The callback
     */
    purge(resourceGroupName: string, resourceName: string, body: Models.ComponentPurgeBody, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ComponentPurgeResponse>): void;
    /**
     * Get status for an ongoing purge operation.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param purgeId In a purge status request, this is the Id of the operation the status of which is
     * returned.
     * @param [options] The optional parameters
     * @returns Promise<Models.ComponentsGetPurgeStatusResponse>
     */
    getPurgeStatus(resourceGroupName: string, resourceName: string, purgeId: string, options?: msRest.RequestOptionsBase): Promise<Models.ComponentsGetPurgeStatusResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param purgeId In a purge status request, this is the Id of the operation the status of which is
     * returned.
     * @param callback The callback
     */
    getPurgeStatus(resourceGroupName: string, resourceName: string, purgeId: string, callback: msRest.ServiceCallback<Models.ComponentPurgeStatusResponse>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param purgeId In a purge status request, this is the Id of the operation the status of which is
     * returned.
     * @param options The optional parameters
     * @param callback The callback
     */
    getPurgeStatus(resourceGroupName: string, resourceName: string, purgeId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ComponentPurgeStatusResponse>): void;
    /**
     * Gets a list of all Application Insights components within a subscription.
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param [options] The optional parameters
     * @returns Promise<Models.ComponentsListNextResponse>
     */
    listNext(nextPageLink: string, options?: msRest.RequestOptionsBase): Promise<Models.ComponentsListNextResponse>;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param callback The callback
     */
    listNext(nextPageLink: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentListResult>): void;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param options The optional parameters
     * @param callback The callback
     */
    listNext(nextPageLink: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentListResult>): void;
    /**
     * Gets a list of Application Insights components within a resource group.
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param [options] The optional parameters
     * @returns Promise<Models.ComponentsListByResourceGroupNextResponse>
     */
    listByResourceGroupNext(nextPageLink: string, options?: msRest.RequestOptionsBase): Promise<Models.ComponentsListByResourceGroupNextResponse>;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param callback The callback
     */
    listByResourceGroupNext(nextPageLink: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentListResult>): void;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param options The optional parameters
     * @param callback The callback
     */
    listByResourceGroupNext(nextPageLink: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentListResult>): void;
}
//# sourceMappingURL=components.d.ts.map