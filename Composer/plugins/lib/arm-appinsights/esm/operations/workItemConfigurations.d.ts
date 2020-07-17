import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { ApplicationInsightsManagementClientContext } from "../applicationInsightsManagementClientContext";
/** Class representing a WorkItemConfigurations. */
export declare class WorkItemConfigurations {
    private readonly client;
    /**
     * Create a WorkItemConfigurations.
     * @param {ApplicationInsightsManagementClientContext} client Reference to the service client.
     */
    constructor(client: ApplicationInsightsManagementClientContext);
    /**
     * Gets the list work item configurations that exist for the application
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.WorkItemConfigurationsListResponse>
     */
    list(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<Models.WorkItemConfigurationsListResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param callback The callback
     */
    list(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<Models.WorkItemConfigurationsListResult>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    list(resourceGroupName: string, resourceName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.WorkItemConfigurationsListResult>): void;
    /**
     * Create a work item configuration for an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param workItemConfigurationProperties Properties that need to be specified to create a work
     * item configuration of a Application Insights component.
     * @param [options] The optional parameters
     * @returns Promise<Models.WorkItemConfigurationsCreateResponse>
     */
    create(resourceGroupName: string, resourceName: string, workItemConfigurationProperties: Models.WorkItemCreateConfiguration, options?: msRest.RequestOptionsBase): Promise<Models.WorkItemConfigurationsCreateResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param workItemConfigurationProperties Properties that need to be specified to create a work
     * item configuration of a Application Insights component.
     * @param callback The callback
     */
    create(resourceGroupName: string, resourceName: string, workItemConfigurationProperties: Models.WorkItemCreateConfiguration, callback: msRest.ServiceCallback<Models.WorkItemConfiguration>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param workItemConfigurationProperties Properties that need to be specified to create a work
     * item configuration of a Application Insights component.
     * @param options The optional parameters
     * @param callback The callback
     */
    create(resourceGroupName: string, resourceName: string, workItemConfigurationProperties: Models.WorkItemCreateConfiguration, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.WorkItemConfiguration>): void;
    /**
     * Gets default work item configurations that exist for the application
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.WorkItemConfigurationsGetDefaultResponse>
     */
    getDefault(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<Models.WorkItemConfigurationsGetDefaultResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param callback The callback
     */
    getDefault(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<Models.WorkItemConfiguration>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    getDefault(resourceGroupName: string, resourceName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.WorkItemConfiguration>): void;
    /**
     * Delete an workitem configuration of an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param workItemConfigId The unique work item configuration Id. This can be either friendly name
     * of connector as defined in connector configuration
     * @param [options] The optional parameters
     * @returns Promise<Models.WorkItemConfigurationsDeleteMethodResponse>
     */
    deleteMethod(resourceGroupName: string, resourceName: string, workItemConfigId: string, options?: msRest.RequestOptionsBase): Promise<Models.WorkItemConfigurationsDeleteMethodResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param workItemConfigId The unique work item configuration Id. This can be either friendly name
     * of connector as defined in connector configuration
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, workItemConfigId: string, callback: msRest.ServiceCallback<any>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param workItemConfigId The unique work item configuration Id. This can be either friendly name
     * of connector as defined in connector configuration
     * @param options The optional parameters
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, workItemConfigId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<any>): void;
}
//# sourceMappingURL=workItemConfigurations.d.ts.map