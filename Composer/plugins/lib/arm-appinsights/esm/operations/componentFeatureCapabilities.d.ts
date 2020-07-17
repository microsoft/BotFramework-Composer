import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { ApplicationInsightsManagementClientContext } from "../applicationInsightsManagementClientContext";
/** Class representing a ComponentFeatureCapabilities. */
export declare class ComponentFeatureCapabilities {
    private readonly client;
    /**
     * Create a ComponentFeatureCapabilities.
     * @param {ApplicationInsightsManagementClientContext} client Reference to the service client.
     */
    constructor(client: ApplicationInsightsManagementClientContext);
    /**
     * Returns feature capabilites of the application insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.ComponentFeatureCapabilitiesGetResponse>
     */
    get(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<Models.ComponentFeatureCapabilitiesGetResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentFeatureCapabilities>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentFeatureCapabilities>): void;
}
//# sourceMappingURL=componentFeatureCapabilities.d.ts.map