import * as msRest from "@azure/ms-rest-js";
import * as Models from "./models";
import * as Mappers from "./models/mappers";
import * as operations from "./operations";
import { AzureBotServiceContext } from "./azureBotServiceContext";
declare class AzureBotService extends AzureBotServiceContext {
    bots: operations.Bots;
    channels: operations.Channels;
    operations: operations.Operations;
    botConnection: operations.BotConnection;
    enterpriseChannels: operations.EnterpriseChannels;
    /**
     * Initializes a new instance of the AzureBotService class.
     * @param credentials Credentials needed for the client to connect to Azure.
     * @param subscriptionId Azure Subscription ID.
     * @param [options] The parameter options
     */
    constructor(credentials: msRest.ServiceClientCredentials, subscriptionId: string, options?: Models.AzureBotServiceOptions);
}
export { AzureBotService, AzureBotServiceContext, Models as AzureBotServiceModels, Mappers as AzureBotServiceMappers };
export * from "./operations";
//# sourceMappingURL=azureBotService.d.ts.map