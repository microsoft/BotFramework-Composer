import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { ApplicationInsightsManagementClientContext } from "../applicationInsightsManagementClientContext";
/** Class representing a ExportConfigurations. */
export declare class ExportConfigurations {
    private readonly client;
    /**
     * Create a ExportConfigurations.
     * @param {ApplicationInsightsManagementClientContext} client Reference to the service client.
     */
    constructor(client: ApplicationInsightsManagementClientContext);
    /**
     * Gets a list of Continuous Export configuration of an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.ExportConfigurationsListResponse>
     */
    list(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<Models.ExportConfigurationsListResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param callback The callback
     */
    list(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentExportConfiguration[]>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    list(resourceGroupName: string, resourceName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentExportConfiguration[]>): void;
    /**
     * Create a Continuous Export configuration of an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param exportProperties Properties that need to be specified to create a Continuous Export
     * configuration of a Application Insights component.
     * @param [options] The optional parameters
     * @returns Promise<Models.ExportConfigurationsCreateResponse>
     */
    create(resourceGroupName: string, resourceName: string, exportProperties: Models.ApplicationInsightsComponentExportRequest, options?: msRest.RequestOptionsBase): Promise<Models.ExportConfigurationsCreateResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param exportProperties Properties that need to be specified to create a Continuous Export
     * configuration of a Application Insights component.
     * @param callback The callback
     */
    create(resourceGroupName: string, resourceName: string, exportProperties: Models.ApplicationInsightsComponentExportRequest, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentExportConfiguration[]>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param exportProperties Properties that need to be specified to create a Continuous Export
     * configuration of a Application Insights component.
     * @param options The optional parameters
     * @param callback The callback
     */
    create(resourceGroupName: string, resourceName: string, exportProperties: Models.ApplicationInsightsComponentExportRequest, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentExportConfiguration[]>): void;
    /**
     * Delete a Continuous Export configuration of an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param exportId The Continuous Export configuration ID. This is unique within a Application
     * Insights component.
     * @param [options] The optional parameters
     * @returns Promise<Models.ExportConfigurationsDeleteMethodResponse>
     */
    deleteMethod(resourceGroupName: string, resourceName: string, exportId: string, options?: msRest.RequestOptionsBase): Promise<Models.ExportConfigurationsDeleteMethodResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param exportId The Continuous Export configuration ID. This is unique within a Application
     * Insights component.
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, exportId: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentExportConfiguration>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param exportId The Continuous Export configuration ID. This is unique within a Application
     * Insights component.
     * @param options The optional parameters
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, exportId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentExportConfiguration>): void;
    /**
     * Get the Continuous Export configuration for this export id.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param exportId The Continuous Export configuration ID. This is unique within a Application
     * Insights component.
     * @param [options] The optional parameters
     * @returns Promise<Models.ExportConfigurationsGetResponse>
     */
    get(resourceGroupName: string, resourceName: string, exportId: string, options?: msRest.RequestOptionsBase): Promise<Models.ExportConfigurationsGetResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param exportId The Continuous Export configuration ID. This is unique within a Application
     * Insights component.
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, exportId: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentExportConfiguration>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param exportId The Continuous Export configuration ID. This is unique within a Application
     * Insights component.
     * @param options The optional parameters
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, exportId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentExportConfiguration>): void;
    /**
     * Update the Continuous Export configuration for this export id.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param exportId The Continuous Export configuration ID. This is unique within a Application
     * Insights component.
     * @param exportProperties Properties that need to be specified to update the Continuous Export
     * configuration.
     * @param [options] The optional parameters
     * @returns Promise<Models.ExportConfigurationsUpdateResponse>
     */
    update(resourceGroupName: string, resourceName: string, exportId: string, exportProperties: Models.ApplicationInsightsComponentExportRequest, options?: msRest.RequestOptionsBase): Promise<Models.ExportConfigurationsUpdateResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param exportId The Continuous Export configuration ID. This is unique within a Application
     * Insights component.
     * @param exportProperties Properties that need to be specified to update the Continuous Export
     * configuration.
     * @param callback The callback
     */
    update(resourceGroupName: string, resourceName: string, exportId: string, exportProperties: Models.ApplicationInsightsComponentExportRequest, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentExportConfiguration>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param exportId The Continuous Export configuration ID. This is unique within a Application
     * Insights component.
     * @param exportProperties Properties that need to be specified to update the Continuous Export
     * configuration.
     * @param options The optional parameters
     * @param callback The callback
     */
    update(resourceGroupName: string, resourceName: string, exportId: string, exportProperties: Models.ApplicationInsightsComponentExportRequest, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentExportConfiguration>): void;
}
//# sourceMappingURL=exportConfigurations.d.ts.map