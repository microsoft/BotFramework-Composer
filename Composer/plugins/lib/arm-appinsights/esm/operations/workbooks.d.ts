import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { ApplicationInsightsManagementClientContext } from "../applicationInsightsManagementClientContext";
/** Class representing a Workbooks. */
export declare class Workbooks {
    private readonly client;
    /**
     * Create a Workbooks.
     * @param {ApplicationInsightsManagementClientContext} client Reference to the service client.
     */
    constructor(client: ApplicationInsightsManagementClientContext);
    /**
     * Get all Workbooks defined within a specified resource group and category.
     * @param resourceGroupName The name of the resource group.
     * @param category Category of workbook to return. Possible values include: 'workbook', 'TSG',
     * 'performance', 'retention'
     * @param [options] The optional parameters
     * @returns Promise<Models.WorkbooksListByResourceGroupResponse>
     */
    listByResourceGroup(resourceGroupName: string, category: Models.CategoryType, options?: Models.WorkbooksListByResourceGroupOptionalParams): Promise<Models.WorkbooksListByResourceGroupResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param category Category of workbook to return. Possible values include: 'workbook', 'TSG',
     * 'performance', 'retention'
     * @param callback The callback
     */
    listByResourceGroup(resourceGroupName: string, category: Models.CategoryType, callback: msRest.ServiceCallback<Models.WorkbooksListResult>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param category Category of workbook to return. Possible values include: 'workbook', 'TSG',
     * 'performance', 'retention'
     * @param options The optional parameters
     * @param callback The callback
     */
    listByResourceGroup(resourceGroupName: string, category: Models.CategoryType, options: Models.WorkbooksListByResourceGroupOptionalParams, callback: msRest.ServiceCallback<Models.WorkbooksListResult>): void;
    /**
     * Get a single workbook by its resourceName.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.WorkbooksGetResponse>
     */
    get(resourceGroupName: string, resourceName: string, options?: msRest.RequestOptionsBase): Promise<Models.WorkbooksGetResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<Models.Workbook>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.Workbook>): void;
    /**
     * Delete a workbook.
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
     * Create a new workbook.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param workbookProperties Properties that need to be specified to create a new workbook.
     * @param [options] The optional parameters
     * @returns Promise<Models.WorkbooksCreateOrUpdateResponse>
     */
    createOrUpdate(resourceGroupName: string, resourceName: string, workbookProperties: Models.Workbook, options?: msRest.RequestOptionsBase): Promise<Models.WorkbooksCreateOrUpdateResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param workbookProperties Properties that need to be specified to create a new workbook.
     * @param callback The callback
     */
    createOrUpdate(resourceGroupName: string, resourceName: string, workbookProperties: Models.Workbook, callback: msRest.ServiceCallback<Models.Workbook>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param workbookProperties Properties that need to be specified to create a new workbook.
     * @param options The optional parameters
     * @param callback The callback
     */
    createOrUpdate(resourceGroupName: string, resourceName: string, workbookProperties: Models.Workbook, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.Workbook>): void;
    /**
     * Updates a workbook that has already been added.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param workbookProperties Properties that need to be specified to create a new workbook.
     * @param [options] The optional parameters
     * @returns Promise<Models.WorkbooksUpdateResponse>
     */
    update(resourceGroupName: string, resourceName: string, workbookProperties: Models.Workbook, options?: msRest.RequestOptionsBase): Promise<Models.WorkbooksUpdateResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param workbookProperties Properties that need to be specified to create a new workbook.
     * @param callback The callback
     */
    update(resourceGroupName: string, resourceName: string, workbookProperties: Models.Workbook, callback: msRest.ServiceCallback<Models.Workbook>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param workbookProperties Properties that need to be specified to create a new workbook.
     * @param options The optional parameters
     * @param callback The callback
     */
    update(resourceGroupName: string, resourceName: string, workbookProperties: Models.Workbook, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.Workbook>): void;
}
//# sourceMappingURL=workbooks.d.ts.map