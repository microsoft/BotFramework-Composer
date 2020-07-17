import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { ApplicationInsightsManagementClientContext } from "../applicationInsightsManagementClientContext";
/** Class representing a WebTests. */
export declare class WebTests {
    private readonly client;
    /**
     * Create a WebTests.
     * @param {ApplicationInsightsManagementClientContext} client Reference to the service client.
     */
    constructor(client: ApplicationInsightsManagementClientContext);
    /**
     * Get all Application Insights web tests defined within a specified resource group.
     * @param resourceGroupName The name of the resource group.
     * @param [options] The optional parameters
     * @returns Promise<Models.WebTestsListByResourceGroupResponse>
     */
    listByResourceGroup(resourceGroupName: string, options?: msRest.RequestOptionsBase): Promise<Models.WebTestsListByResourceGroupResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param callback The callback
     */
    listByResourceGroup(resourceGroupName: string, callback: msRest.ServiceCallback<Models.WebTestListResult>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param options The optional parameters
     * @param callback The callback
     */
    listByResourceGroup(resourceGroupName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.WebTestListResult>): void;
    /**
     * Get a specific Application Insights web test definition.
     * @param resourceGroupName The name of the resource group.
     * @param webTestName The name of the Application Insights webtest resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.WebTestsGetResponse>
     */
    get(resourceGroupName: string, webTestName: string, options?: msRest.RequestOptionsBase): Promise<Models.WebTestsGetResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param webTestName The name of the Application Insights webtest resource.
     * @param callback The callback
     */
    get(resourceGroupName: string, webTestName: string, callback: msRest.ServiceCallback<Models.WebTest>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param webTestName The name of the Application Insights webtest resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    get(resourceGroupName: string, webTestName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.WebTest>): void;
    /**
     * Creates or updates an Application Insights web test definition.
     * @param resourceGroupName The name of the resource group.
     * @param webTestName The name of the Application Insights webtest resource.
     * @param webTestDefinition Properties that need to be specified to create or update an Application
     * Insights web test definition.
     * @param [options] The optional parameters
     * @returns Promise<Models.WebTestsCreateOrUpdateResponse>
     */
    createOrUpdate(resourceGroupName: string, webTestName: string, webTestDefinition: Models.WebTest, options?: msRest.RequestOptionsBase): Promise<Models.WebTestsCreateOrUpdateResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param webTestName The name of the Application Insights webtest resource.
     * @param webTestDefinition Properties that need to be specified to create or update an Application
     * Insights web test definition.
     * @param callback The callback
     */
    createOrUpdate(resourceGroupName: string, webTestName: string, webTestDefinition: Models.WebTest, callback: msRest.ServiceCallback<Models.WebTest>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param webTestName The name of the Application Insights webtest resource.
     * @param webTestDefinition Properties that need to be specified to create or update an Application
     * Insights web test definition.
     * @param options The optional parameters
     * @param callback The callback
     */
    createOrUpdate(resourceGroupName: string, webTestName: string, webTestDefinition: Models.WebTest, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.WebTest>): void;
    /**
     * Creates or updates an Application Insights web test definition.
     * @param resourceGroupName The name of the resource group.
     * @param webTestName The name of the Application Insights webtest resource.
     * @param webTestTags Updated tag information to set into the web test instance.
     * @param [options] The optional parameters
     * @returns Promise<Models.WebTestsUpdateTagsResponse>
     */
    updateTags(resourceGroupName: string, webTestName: string, webTestTags: Models.TagsResource, options?: msRest.RequestOptionsBase): Promise<Models.WebTestsUpdateTagsResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param webTestName The name of the Application Insights webtest resource.
     * @param webTestTags Updated tag information to set into the web test instance.
     * @param callback The callback
     */
    updateTags(resourceGroupName: string, webTestName: string, webTestTags: Models.TagsResource, callback: msRest.ServiceCallback<Models.WebTest>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param webTestName The name of the Application Insights webtest resource.
     * @param webTestTags Updated tag information to set into the web test instance.
     * @param options The optional parameters
     * @param callback The callback
     */
    updateTags(resourceGroupName: string, webTestName: string, webTestTags: Models.TagsResource, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.WebTest>): void;
    /**
     * Deletes an Application Insights web test.
     * @param resourceGroupName The name of the resource group.
     * @param webTestName The name of the Application Insights webtest resource.
     * @param [options] The optional parameters
     * @returns Promise<msRest.RestResponse>
     */
    deleteMethod(resourceGroupName: string, webTestName: string, options?: msRest.RequestOptionsBase): Promise<msRest.RestResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param webTestName The name of the Application Insights webtest resource.
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, webTestName: string, callback: msRest.ServiceCallback<void>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param webTestName The name of the Application Insights webtest resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, webTestName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<void>): void;
    /**
     * Get all Application Insights web test alerts definitioned within a subscription.
     * @param [options] The optional parameters
     * @returns Promise<Models.WebTestsListResponse>
     */
    list(options?: msRest.RequestOptionsBase): Promise<Models.WebTestsListResponse>;
    /**
     * @param callback The callback
     */
    list(callback: msRest.ServiceCallback<Models.WebTestListResult>): void;
    /**
     * @param options The optional parameters
     * @param callback The callback
     */
    list(options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.WebTestListResult>): void;
    /**
     * Get all Application Insights web tests defined for the specified component.
     * @param componentName The name of the Application Insights component resource.
     * @param resourceGroupName The name of the resource group.
     * @param [options] The optional parameters
     * @returns Promise<Models.WebTestsListByComponentResponse>
     */
    listByComponent(componentName: string, resourceGroupName: string, options?: msRest.RequestOptionsBase): Promise<Models.WebTestsListByComponentResponse>;
    /**
     * @param componentName The name of the Application Insights component resource.
     * @param resourceGroupName The name of the resource group.
     * @param callback The callback
     */
    listByComponent(componentName: string, resourceGroupName: string, callback: msRest.ServiceCallback<Models.WebTestListResult>): void;
    /**
     * @param componentName The name of the Application Insights component resource.
     * @param resourceGroupName The name of the resource group.
     * @param options The optional parameters
     * @param callback The callback
     */
    listByComponent(componentName: string, resourceGroupName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.WebTestListResult>): void;
    /**
     * Get all Application Insights web tests defined within a specified resource group.
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param [options] The optional parameters
     * @returns Promise<Models.WebTestsListByResourceGroupNextResponse>
     */
    listByResourceGroupNext(nextPageLink: string, options?: msRest.RequestOptionsBase): Promise<Models.WebTestsListByResourceGroupNextResponse>;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param callback The callback
     */
    listByResourceGroupNext(nextPageLink: string, callback: msRest.ServiceCallback<Models.WebTestListResult>): void;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param options The optional parameters
     * @param callback The callback
     */
    listByResourceGroupNext(nextPageLink: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.WebTestListResult>): void;
    /**
     * Get all Application Insights web test alerts definitioned within a subscription.
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param [options] The optional parameters
     * @returns Promise<Models.WebTestsListNextResponse>
     */
    listNext(nextPageLink: string, options?: msRest.RequestOptionsBase): Promise<Models.WebTestsListNextResponse>;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param callback The callback
     */
    listNext(nextPageLink: string, callback: msRest.ServiceCallback<Models.WebTestListResult>): void;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param options The optional parameters
     * @param callback The callback
     */
    listNext(nextPageLink: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.WebTestListResult>): void;
    /**
     * Get all Application Insights web tests defined for the specified component.
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param [options] The optional parameters
     * @returns Promise<Models.WebTestsListByComponentNextResponse>
     */
    listByComponentNext(nextPageLink: string, options?: msRest.RequestOptionsBase): Promise<Models.WebTestsListByComponentNextResponse>;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param callback The callback
     */
    listByComponentNext(nextPageLink: string, callback: msRest.ServiceCallback<Models.WebTestListResult>): void;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param options The optional parameters
     * @param callback The callback
     */
    listByComponentNext(nextPageLink: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.WebTestListResult>): void;
}
//# sourceMappingURL=webTests.d.ts.map