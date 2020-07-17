import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { ApplicationInsightsManagementClientContext } from "../applicationInsightsManagementClientContext";
/** Class representing a ProactiveDetectionConfigurations. */
export declare class ProactiveDetectionConfigurations {
    private readonly client;
    /**
     * Create a ProactiveDetectionConfigurations.
     * @param {ApplicationInsightsManagementClientContext} client Reference to the service client.
     */
    constructor(client: ApplicationInsightsManagementClientContext);
    /**
     * Gets a list of ProactiveDetection configurations of an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.ProactiveDetectionConfigurationsListResponse>
     */
    list(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<Models.ProactiveDetectionConfigurationsListResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param callback The callback
     */
    list(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentProactiveDetectionConfiguration[]>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    list(resourceGroupName: string, resourceName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentProactiveDetectionConfiguration[]>): void;
    /**
     * Get the ProactiveDetection configuration for this configuration id.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param configurationId The ProactiveDetection configuration ID. This is unique within a
     * Application Insights component.
     * @param [options] The optional parameters
     * @returns Promise<Models.ProactiveDetectionConfigurationsGetResponse>
     */
    get(resourceGroupName: string, resourceName: string, configurationId: string, options?: msRest.RequestOptionsBase): Promise<Models.ProactiveDetectionConfigurationsGetResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param configurationId The ProactiveDetection configuration ID. This is unique within a
     * Application Insights component.
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, configurationId: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentProactiveDetectionConfiguration>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param configurationId The ProactiveDetection configuration ID. This is unique within a
     * Application Insights component.
     * @param options The optional parameters
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, configurationId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentProactiveDetectionConfiguration>): void;
    /**
     * Update the ProactiveDetection configuration for this configuration id.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param configurationId The ProactiveDetection configuration ID. This is unique within a
     * Application Insights component.
     * @param proactiveDetectionProperties Properties that need to be specified to update the
     * ProactiveDetection configuration.
     * @param [options] The optional parameters
     * @returns Promise<Models.ProactiveDetectionConfigurationsUpdateResponse>
     */
    update(resourceGroupName: string, resourceName: string, configurationId: string, proactiveDetectionProperties: Models.ApplicationInsightsComponentProactiveDetectionConfiguration, options?: msRest.RequestOptionsBase): Promise<Models.ProactiveDetectionConfigurationsUpdateResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param configurationId The ProactiveDetection configuration ID. This is unique within a
     * Application Insights component.
     * @param proactiveDetectionProperties Properties that need to be specified to update the
     * ProactiveDetection configuration.
     * @param callback The callback
     */
    update(resourceGroupName: string, resourceName: string, configurationId: string, proactiveDetectionProperties: Models.ApplicationInsightsComponentProactiveDetectionConfiguration, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentProactiveDetectionConfiguration>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param configurationId The ProactiveDetection configuration ID. This is unique within a
     * Application Insights component.
     * @param proactiveDetectionProperties Properties that need to be specified to update the
     * ProactiveDetection configuration.
     * @param options The optional parameters
     * @param callback The callback
     */
    update(resourceGroupName: string, resourceName: string, configurationId: string, proactiveDetectionProperties: Models.ApplicationInsightsComponentProactiveDetectionConfiguration, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentProactiveDetectionConfiguration>): void;
}
//# sourceMappingURL=proactiveDetectionConfigurations.d.ts.map