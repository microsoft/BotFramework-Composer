import * as Models from "./models";
import * as msRest from "@azure/ms-rest-js";
import * as msRestAzure from "@azure/ms-rest-azure-js";
export declare class AzureBotServiceContext extends msRestAzure.AzureServiceClient {
    credentials: msRest.ServiceClientCredentials;
    subscriptionId: string;
    apiVersion?: string;
    /**
     * Initializes a new instance of the AzureBotService class.
     * @param credentials Credentials needed for the client to connect to Azure.
     * @param subscriptionId Azure Subscription ID.
     * @param [options] The parameter options
     */
    constructor(credentials: msRest.ServiceClientCredentials, subscriptionId: string, options?: Models.AzureBotServiceOptions);
}
//# sourceMappingURL=azureBotServiceContext.d.ts.map