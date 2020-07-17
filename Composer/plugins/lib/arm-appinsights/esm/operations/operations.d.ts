import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { ApplicationInsightsManagementClientContext } from "../applicationInsightsManagementClientContext";
/** Class representing a Operations. */
export declare class Operations {
    private readonly client;
    /**
     * Create a Operations.
     * @param {ApplicationInsightsManagementClientContext} client Reference to the service client.
     */
    constructor(client: ApplicationInsightsManagementClientContext);
    /**
     * Lists all of the available insights REST API operations.
     * @param [options] The optional parameters
     * @returns Promise<Models.OperationsListResponse>
     */
    list(options?: msRest.RequestOptionsBase): Promise<Models.OperationsListResponse>;
    /**
     * @param callback The callback
     */
    list(callback: msRest.ServiceCallback<Models.OperationListResult>): void;
    /**
     * @param options The optional parameters
     * @param callback The callback
     */
    list(options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.OperationListResult>): void;
    /**
     * Lists all of the available insights REST API operations.
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param [options] The optional parameters
     * @returns Promise<Models.OperationsListNextResponse>
     */
    listNext(nextPageLink: string, options?: msRest.RequestOptionsBase): Promise<Models.OperationsListNextResponse>;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param callback The callback
     */
    listNext(nextPageLink: string, callback: msRest.ServiceCallback<Models.OperationListResult>): void;
    /**
     * @param nextPageLink The NextLink from the previous successful call to List operation.
     * @param options The optional parameters
     * @param callback The callback
     */
    listNext(nextPageLink: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.OperationListResult>): void;
}
//# sourceMappingURL=operations.d.ts.map