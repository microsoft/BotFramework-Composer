import * as Models from "./models";
import * as msRest from "@azure/ms-rest-js";
import * as msRestAzure from "@azure/ms-rest-azure-js";
export declare class ApplicationInsightsManagementClientContext extends msRestAzure.AzureServiceClient {
    credentials: msRest.ServiceClientCredentials;
    apiVersion?: string;
    subscriptionId: string;
    /**
     * Initializes a new instance of the ApplicationInsightsManagementClient class.
     * @param credentials Credentials needed for the client to connect to Azure.
     * @param subscriptionId The Azure subscription ID.
     * @param [options] The parameter options
     */
    constructor(credentials: msRest.ServiceClientCredentials, subscriptionId: string, options?: Models.ApplicationInsightsManagementClientOptions);
}
//# sourceMappingURL=applicationInsightsManagementClientContext.d.ts.map