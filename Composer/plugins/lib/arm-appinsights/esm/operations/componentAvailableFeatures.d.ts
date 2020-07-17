import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { ApplicationInsightsManagementClientContext } from "../applicationInsightsManagementClientContext";
/** Class representing a ComponentAvailableFeatures. */
export declare class ComponentAvailableFeatures {
    private readonly client;
    /**
     * Create a ComponentAvailableFeatures.
     * @param {ApplicationInsightsManagementClientContext} client Reference to the service client.
     */
    constructor(client: ApplicationInsightsManagementClientContext);
    /**
     * Returns all available features of the application insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.ComponentAvailableFeaturesGetResponse>
     */
    get(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<Models.ComponentAvailableFeaturesGetResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentAvailableFeatures>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentAvailableFeatures>): void;
}
//# sourceMappingURL=componentAvailableFeatures.d.ts.map