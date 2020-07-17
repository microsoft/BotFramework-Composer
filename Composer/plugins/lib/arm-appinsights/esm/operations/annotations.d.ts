import * as msRest from "@azure/ms-rest-js";
import * as Models from "../models";
import { ApplicationInsightsManagementClientContext } from "../applicationInsightsManagementClientContext";
/** Class representing a Annotations. */
export declare class Annotations {
    private readonly client;
    /**
     * Create a Annotations.
     * @param {ApplicationInsightsManagementClientContext} client Reference to the service client.
     */
    constructor(client: ApplicationInsightsManagementClientContext);
    /**
     * Gets the list of annotations for a component for given time range
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param start The start time to query from for annotations, cannot be older than 90 days from
     * current date.
     * @param end The end time to query for annotations.
     * @param [options] The optional parameters
     * @returns Promise<Models.AnnotationsListResponse>
     */
    list(resourceGroupName: string, resourceName: string, start: string, end: string, options?: msRest.RequestOptionsBase): Promise<Models.AnnotationsListResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param start The start time to query from for annotations, cannot be older than 90 days from
     * current date.
     * @param end The end time to query for annotations.
     * @param callback The callback
     */
    list(resourceGroupName: string, resourceName: string, start: string, end: string, callback: msRest.ServiceCallback<Models.AnnotationsListResult>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param start The start time to query from for annotations, cannot be older than 90 days from
     * current date.
     * @param end The end time to query for annotations.
     * @param options The optional parameters
     * @param callback The callback
     */
    list(resourceGroupName: string, resourceName: string, start: string, end: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.AnnotationsListResult>): void;
    /**
     * Create an Annotation of an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param annotationProperties Properties that need to be specified to create an annotation of a
     * Application Insights component.
     * @param [options] The optional parameters
     * @returns Promise<Models.AnnotationsCreateResponse>
     */
    create(resourceGroupName: string, resourceName: string, annotationProperties: Models.Annotation, options?: msRest.RequestOptionsBase): Promise<Models.AnnotationsCreateResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param annotationProperties Properties that need to be specified to create an annotation of a
     * Application Insights component.
     * @param callback The callback
     */
    create(resourceGroupName: string, resourceName: string, annotationProperties: Models.Annotation, callback: msRest.ServiceCallback<Models.Annotation[]>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param annotationProperties Properties that need to be specified to create an annotation of a
     * Application Insights component.
     * @param options The optional parameters
     * @param callback The callback
     */
    create(resourceGroupName: string, resourceName: string, annotationProperties: Models.Annotation, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.Annotation[]>): void;
    /**
     * Delete an Annotation of an Application Insights component.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param annotationId The unique annotation ID. This is unique within a Application Insights
     * component.
     * @param [options] The optional parameters
     * @returns Promise<Models.AnnotationsDeleteMethodResponse>
     */
    deleteMethod(resourceGroupName: string, resourceName: string, annotationId: string, options?: msRest.RequestOptionsBase): Promise<Models.AnnotationsDeleteMethodResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param annotationId The unique annotation ID. This is unique within a Application Insights
     * component.
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, annotationId: string, callback: msRest.ServiceCallback<any>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param annotationId The unique annotation ID. This is unique within a Application Insights
     * component.
     * @param options The optional parameters
     * @param callback The callback
     */
    deleteMethod(resourceGroupName: string, resourceName: string, annotationId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<any>): void;
    /**
     * Get the annotation for given id.
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param annotationId The unique annotation ID. This is unique within a Application Insights
     * component.
     * @param [options] The optional parameters
     * @returns Promise<Models.AnnotationsGetResponse>
     */
    get(resourceGroupName: string, resourceName: string, annotationId: string, options?: msRest.RequestOptionsBase): Promise<Models.AnnotationsGetResponse>;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param annotationId The unique annotation ID. This is unique within a Application Insights
     * component.
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, annotationId: string, callback: msRest.ServiceCallback<Models.Annotation[]>): void;
    /**
     * @param resourceGroupName The name of the resource group.
     * @param resourceName The name of the Application Insights component resource.
     * @param annotationId The unique annotation ID. This is unique within a Application Insights
     * component.
     * @param options The optional parameters
     * @param callback The callback
     */
    get(resourceGroupName: string, resourceName: string, annotationId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.Annotation[]>): void;
}
//# sourceMappingURL=annotations.d.ts.map