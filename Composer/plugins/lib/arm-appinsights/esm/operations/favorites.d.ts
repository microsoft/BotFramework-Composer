import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { ApplicationInsightsManagementClientContext } from "../applicationInsightsManagementClientContext";
/** Class representing a Favorites. */
export declare class Favorites {
    private readonly client;
    /**
     * Create a Favorites.
     * @param {ApplicationInsightsManagementClientContext} client Reference to the service client.
     */
    constructor(client: ApplicationInsightsManagementClientContext);
    /**
     * Gets a list of favorites defined within an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param [options] The optional parameters
     * @returns Promise<Models.FavoritesListResponse>
     */
    list(resourceGroupName: string, resourceName: string, options?: Models.FavoritesListOptionalParams): Promise<Models.FavoritesListResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param callback The callback
     */
    list(resourceGroupName: string, resourceName: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentFavorite[]>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param options The optional parameters
     * @param callback The callback
     */
    list(resourceGroupName: string, resourceName: string, options: Models.FavoritesListOptionalParams, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentFavorite[]>): void;
    /**
     * Get a single favorite by its FavoriteId, defined within an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param favoriteId The Id of a specific favorite defined in the Application Insights component
     * @param [options] The optional parameters
     * @returns Promise<Models.FavoritesGetResponse>
     */
    get(resourceGroupName: string, resourceName: string, favoriteId: string, options?: msRest.RequestOptionsBase): Promise<Models.FavoritesGetResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param favoriteId The Id of a specific favorite defined in the Application Insights component
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, favoriteId: string, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentFavorite>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param favoriteId The Id of a specific favorite defined in the Application Insights component
     * @param options The optional parameters
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, favoriteId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentFavorite>): void;
    /**
     * Adds a new favorites to an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param favoriteId The Id of a specific favorite defined in the Application Insights component
     * @param favoriteProperties Properties that need to be specified to create a new favorite and add
     * it to an Application Insights component.
     * @param [options] The optional parameters
     * @returns Promise<Models.FavoritesAddResponse>
     */
    add(resourceGroupName: string, resourceName: string, favoriteId: string, favoriteProperties: Models.ApplicationInsightsComponentFavorite, options?: msRest.RequestOptionsBase): Promise<Models.FavoritesAddResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param favoriteId The Id of a specific favorite defined in the Application Insights component
     * @param favoriteProperties Properties that need to be specified to create a new favorite and add
     * it to an Application Insights component.
     * @param callback The callback
     */
    add(resourceGroupName: string, resourceName: string, favoriteId: string, favoriteProperties: Models.ApplicationInsightsComponentFavorite, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentFavorite>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param favoriteId The Id of a specific favorite defined in the Application Insights component
     * @param favoriteProperties Properties that need to be specified to create a new favorite and add
     * it to an Application Insights component.
     * @param options The optional parameters
     * @param callback The callback
     */
    add(resourceGroupName: string, resourceName: string, favoriteId: string, favoriteProperties: Models.ApplicationInsightsComponentFavorite, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentFavorite>): void;
    /**
     * Updates a favorite that has already been added to an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param favoriteId The Id of a specific favorite defined in the Application Insights component
     * @param favoriteProperties Properties that need to be specified to update the existing favorite.
     * @param [options] The optional parameters
     * @returns Promise<Models.FavoritesUpdateResponse>
     */
    update(resourceGroupName: string, resourceName: string, favoriteId: string, favoriteProperties: Models.ApplicationInsightsComponentFavorite, options?: msRest.RequestOptionsBase): Promise<Models.FavoritesUpdateResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param favoriteId The Id of a specific favorite defined in the Application Insights component
     * @param favoriteProperties Properties that need to be specified to update the existing favorite.
     * @param callback The callback
     */
    update(resourceGroupName: string, resourceName: string, favoriteId: string, favoriteProperties: Models.ApplicationInsightsComponentFavorite, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentFavorite>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param favoriteId The Id of a specific favorite defined in the Application Insights component
     * @param favoriteProperties Properties that need to be specified to update the existing favorite.
     * @param options The optional parameters
     * @param callback The callback
     */
    update(resourceGroupName: string, resourceName: string, favoriteId: string, favoriteProperties: Models.ApplicationInsightsComponentFavorite, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ApplicationInsightsComponentFavorite>): void;
    /**
     * Remove a favorite that is associated to an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param favoriteId The Id of a specific favorite defined in the Application Insights component
     * @param [options] The optional parameters
     * @returns Promise<msRest.RestResponse>
     */
    deleteMethod(resourceGroupName: string, resourceName: string, favoriteId: string, options?: msRest.RequestOptionsBase): Promise<msRest.RestResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param favoriteId The Id of a specific favorite defined in the Application Insights component
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, favoriteId: string, callback: msRest.ServiceCallback<void>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param favoriteId The Id of a specific favorite defined in the Application Insights component
     * @param options The optional parameters
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, favoriteId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<void>): void;
}
//# sourceMappingURL=favorites.d.ts.map