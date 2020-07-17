import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { ApplicationInsightsManagementClientContext } from "../applicationInsightsManagementClientContext";
/** Class representing a ComponentCurrentBillingFeatures. */
export declare class ComponentCurrentBillingFeatures {
    private readonly client;
    /**
     * Create a ComponentCurrentBillingFeatures.
     * @param {ApplicationInsightsManagementClientContext} client Reference to the service client.
     */
    constructor(client: ApplicationInsightsManagementClientContext);
    /**
     * Returns current billing features for an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.ComponentCurrentBillingFeaturesGetResponse>
     */
    get(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<Models.ComponentCurrentBillingFeaturesGetResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentBillingFeatures>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentBillingFeatures>): void;
    /**
     * Update current billing features for an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param billingFeaturesProperties Properties that need to be specified to update billing features
     * for an Application Insights component.
     * @param [options] The optional parameters
     * @returns Promise<Models.ComponentCurrentBillingFeaturesUpdateResponse>
     */
    update(resourceGroupName: string, resourceName: string, billingFeaturesProperties: Models.ApplicationInsightsComponentBillingFeatures, options?: msRest.RequestOptionsBase): Promise<Models.ComponentCurrentBillingFeaturesUpdateResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param billingFeaturesProperties Properties that need to be specified to update billing features
     * for an Application Insights component.
     * @param callback The callback
     */
    update(resourceGroupName: string, resourceName: string, billingFeaturesProperties: Models.ApplicationInsightsComponentBillingFeatures, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentBillingFeatures>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param billingFeaturesProperties Properties that need to be specified to update billing features
     * for an Application Insights component.
     * @param options The optional parameters
     * @param callback The callback
     */
    update(resourceGroupName: string, resourceName: string, billingFeaturesProperties: Models.ApplicationInsightsComponentBillingFeatures, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentBillingFeatures>): void;
}
//# sourceMappingURL=componentCurrentBillingFeatures.d.ts.map