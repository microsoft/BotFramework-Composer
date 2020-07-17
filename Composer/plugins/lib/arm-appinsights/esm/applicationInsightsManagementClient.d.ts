import * as msRest from "@azure/ms-rest-js";
import * as Models from "./models";
import * as Mappers from "./models/mappers";
import * as operations from "./operations";
import { ApplicationInsightsManagementClientContext } from "./applicationInsightsManagementClientContext";
declare class ApplicationInsightsManagementClient extends ApplicationInsightsManagementClientContext {
    operations: operations.Operations;
    annotations: operations.Annotations;
    aPIKeys: operations.APIKeys;
    exportConfigurations: operations.ExportConfigurations;
    componentCurrentBillingFeatures: operations.ComponentCurrentBillingFeatures;
    componentQuotaStatus: operations.ComponentQuotaStatus;
    componentFeatureCapabilities: operations.ComponentFeatureCapabilities;
    componentAvailableFeatures: operations.ComponentAvailableFeatures;
    proactiveDetectionConfigurations: operations.ProactiveDetectionConfigurations;
    components: operations.Components;
    workItemConfigurations: operations.WorkItemConfigurations;
    favorites: operations.Favorites;
    webTestLocations: operations.WebTestLocations;
    webTests: operations.WebTests;
    analyticsItems: operations.AnalyticsItems;
    workbooks: operations.Workbooks;
    /**
     * Initializes a new instance of the ApplicationInsightsManagementClient class.
     * @param credentials Credentials needed for the client to connect to Azure.
     * @param subscriptionId The Azure subscription ID.
     * @param [options] The parameter options
     */
    constructor(credentials: msRest.ServiceClientCredentials, subscriptionId: string, options?: Models.ApplicationInsightsManagementClientOptions);
}
export { ApplicationInsightsManagementClient, ApplicationInsightsManagementClientContext, Models as ApplicationInsightsManagementModels, Mappers as ApplicationInsightsManagementMappers };
export * from "./operations";
//# sourceMappingURL=applicationInsightsManagementClient.d.ts.map