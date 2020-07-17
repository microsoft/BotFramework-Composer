import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { ApplicationInsightsManagementClientContext } from "../applicationInsightsManagementClientContext";
/** Class representing a AnalyticsItems. */
export declare class AnalyticsItems {
    private readonly client;
    /**
     * Create a AnalyticsItems.
     * @param {ApplicationInsightsManagementClientContext} client Reference to the service client.
     */
    constructor(client: ApplicationInsightsManagementClientContext);
    /**
     * Gets a list of Analytics Items defined within an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param scopePath Enum indicating if this item definition is owned by a specific user or is
     * shared between all users with access to the Application Insights component. Possible values
     * include: 'analyticsItems', 'myanalyticsItems'
     * @param [options] The optional parameters
     * @returns Promise<Models.AnalyticsItemsListResponse>
     */
    list(resourceGroupName: string, resourceName: string, scopePath: Models.ItemScopePath, options?: Models.AnalyticsItemsListOptionalParams): Promise<Models.AnalyticsItemsListResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param scopePath Enum indicating if this item definition is owned by a specific user or is
     * shared between all users with access to the Application Insights component. Possible values
     * include: 'analyticsItems', 'myanalyticsItems'
     * @param callback The callback
     */
    list(resourceGroupName: string, resourceName: string, scopePath: Models.ItemScopePath, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentAnalyticsItem[]>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param scopePath Enum indicating if this item definition is owned by a specific user or is
     * shared between all users with access to the Application Insights component. Possible values
     * include: 'analyticsItems', 'myanalyticsItems'
     * @param options The optional parameters
     * @param callback The callback
     */
    list(resourceGroupName: string, resourceName: string, scopePath: Models.ItemScopePath, options: Models.AnalyticsItemsListOptionalParams, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentAnalyticsItem[]>): void;
    /**
     * Gets a specific Analytics Items defined within an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param scopePath Enum indicating if this item definition is owned by a specific user or is
     * shared between all users with access to the Application Insights component. Possible values
     * include: 'analyticsItems', 'myanalyticsItems'
     * @param [options] The optional parameters
     * @returns Promise<Models.AnalyticsItemsGetResponse>
     */
    get(resourceGroupName: string, resourceName: string, scopePath: Models.ItemScopePath, options?: Models.AnalyticsItemsGetOptionalParams): Promise<Models.AnalyticsItemsGetResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param scopePath Enum indicating if this item definition is owned by a specific user or is
     * shared between all users with access to the Application Insights component. Possible values
     * include: 'analyticsItems', 'myanalyticsItems'
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, scopePath: Models.ItemScopePath, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentAnalyticsItem>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param scopePath Enum indicating if this item definition is owned by a specific user or is
     * shared between all users with access to the Application Insights component. Possible values
     * include: 'analyticsItems', 'myanalyticsItems'
     * @param options The optional parameters
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, scopePath: Models.ItemScopePath, options: Models.AnalyticsItemsGetOptionalParams, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentAnalyticsItem>): void;
    /**
     * Adds or Updates a specific Analytics Item within an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param scopePath Enum indicating if this item definition is owned by a specific user or is
     * shared between all users with access to the Application Insights component. Possible values
     * include: 'analyticsItems', 'myanalyticsItems'
     * @param itemProperties Properties that need to be specified to create a new item and add it to an
     * Application Insights component.
     * @param [options] The optional parameters
     * @returns Promise<Models.AnalyticsItemsPutResponse>
     */
    put(resourceGroupName: string, resourceName: string, scopePath: Models.ItemScopePath, itemProperties: Models.ApplicationInsightsComponentAnalyticsItem, options?: Models.AnalyticsItemsPutOptionalParams): Promise<Models.AnalyticsItemsPutResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param scopePath Enum indicating if this item definition is owned by a specific user or is
     * shared between all users with access to the Application Insights component. Possible values
     * include: 'analyticsItems', 'myanalyticsItems'
     * @param itemProperties Properties that need to be specified to create a new item and add it to an
     * Application Insights component.
     * @param callback The callback
     */
    put(resourceGroupName: string, resourceName: string, scopePath: Models.ItemScopePath, itemProperties: Models.ApplicationInsightsComponentAnalyticsItem, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentAnalyticsItem>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param scopePath Enum indicating if this item definition is owned by a specific user or is
     * shared between all users with access to the Application Insights component. Possible values
     * include: 'analyticsItems', 'myanalyticsItems'
     * @param itemProperties Properties that need to be specified to create a new item and add it to an
     * Application Insights component.
     * @param options The optional parameters
     * @param callback The callback
     */
    put(resourceGroupName: string, resourceName: string, scopePath: Models.ItemScopePath, itemProperties: Models.ApplicationInsightsComponentAnalyticsItem, options: Models.AnalyticsItemsPutOptionalParams, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentAnalyticsItem>): void;
    /**
     * Deletes a specific Analytics Items defined within an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param scopePath Enum indicating if this item definition is owned by a specific user or is
     * shared between all users with access to the Application Insights component. Possible values
     * include: 'analyticsItems', 'myanalyticsItems'
     * @param [options] The optional parameters
     * @returns Promise<msRest.RestResponse>
     */
    deleteMethod(resourceGroupName: string, resourceName: string, scopePath: Models.ItemScopePath, options?: Models.AnalyticsItemsDeleteMethodOptionalParams): Promise<msRest.RestResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param scopePath Enum indicating if this item definition is owned by a specific user or is
     * shared between all users with access to the Application Insights component. Possible values
     * include: 'analyticsItems', 'myanalyticsItems'
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, scopePath: Models.ItemScopePath, callback: msRest.ServiceCallback<void>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param scopePath Enum indicating if this item definition is owned by a specific user or is
     * shared between all users with access to the Application Insights component. Possible values
     * include: 'analyticsItems', 'myanalyticsItems'
     * @param options The optional parameters
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, scopePath: Models.ItemScopePath, options: Models.AnalyticsItemsDeleteMethodOptionalParams, callback: msRest.ServiceCallback<void>): void;
}
//# sourceMappingURL=analyticsItems.d.ts.map