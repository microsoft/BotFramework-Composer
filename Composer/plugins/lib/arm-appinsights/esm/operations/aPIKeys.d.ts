import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { ApplicationInsightsManagementClientContext } from "../applicationInsightsManagementClientContext";
/** Class representing a APIKeys. */
export declare class APIKeys {
    private readonly client;
    /**
     * Create a APIKeys.
     * @param {ApplicationInsightsManagementClientContext} client Reference to the service client.
     */
    constructor(client: ApplicationInsightsManagementClientContext);
    /**
     * Gets a list of API keys of an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.APIKeysListResponse>
     */
    list(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<Models.APIKeysListResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param callback The callback
     */
    list(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentAPIKeyListResult>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    list(resourceGroupName: string, resourceName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentAPIKeyListResult>): void;
    /**
     * Create an API Key of an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param aPIKeyProperties Properties that need to be specified to create an API key of a
     * Application Insights component.
     * @param [options] The optional parameters
     * @returns Promise<Models.APIKeysCreateResponse>
     */
    create(resourceGroupName: string, resourceName: string, aPIKeyProperties: Models.APIKeyRequest, options?: msRest.RequestOptionsBase): Promise<Models.APIKeysCreateResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param aPIKeyProperties Properties that need to be specified to create an API key of a
     * Application Insights component.
     * @param callback The callback
     */
    create(resourceGroupName: string, resourceName: string, aPIKeyProperties: Models.APIKeyRequest, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentAPIKey>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param aPIKeyProperties Properties that need to be specified to create an API key of a
     * Application Insights component.
     * @param options The optional parameters
     * @param callback The callback
     */
    create(resourceGroupName: string, resourceName: string, aPIKeyProperties: Models.APIKeyRequest, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentAPIKey>): void;
    /**
     * Delete an API Key of an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param keyId The API Key ID. This is unique within a Application Insights component.
     * @param [options] The optional parameters
     * @returns Promise<Models.APIKeysDeleteMethodResponse>
     */
    deleteMethod(resourceGroupName: string, resourceName: string, keyId: string, options?: msRest.RequestOptionsBase): Promise<Models.APIKeysDeleteMethodResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param keyId The API Key ID. This is unique within a Application Insights component.
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, keyId: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentAPIKey>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param keyId The API Key ID. This is unique within a Application Insights component.
     * @param options The optional parameters
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, keyId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentAPIKey>): void;
    /**
     * Get the API Key for this key id.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param keyId The API Key ID. This is unique within a Application Insights component.
     * @param [options] The optional parameters
     * @returns Promise<Models.APIKeysGetResponse>
     */
    get(resourceGroupName: string, resourceName: string, keyId: string, options?: msRest.RequestOptionsBase): Promise<Models.APIKeysGetResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param keyId The API Key ID. This is unique within a Application Insights component.
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, keyId: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentAPIKey>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param keyId The API Key ID. This is unique within a Application Insights component.
     * @param options The optional parameters
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, keyId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentAPIKey>): void;
}
//# sourceMappingURL=aPIKeys.d.ts.map