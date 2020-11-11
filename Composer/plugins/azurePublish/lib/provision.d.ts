import { BotProjectDeployConfig } from './botProjectDeployConfig';
export declare class BotProjectProvision {
    private subId;
    private accessToken;
    private creds;
    private projPath;
    private templatePath;
    private logger;
    private tenantId;
    constructor(config: BotProjectDeployConfig);
    /*******************************************************************************************************************************/
    /**
     * Write updated settings back to the settings file
     */
    private updateDeploymentJsonFile;
    private getErrorMesssage;
    private pack;
    private unpackObject;
    /**
     * Format the parameters
     */
    private getDeploymentTemplateParam;
    private readTemplateFile;
    /***********************************************************************************************
     * Azure API accessors
     **********************************************************************************************/
    /**
     * Use the Azure API to create a new resource group
     */
    private createResourceGroup;
    /**
     * Validate the deployment using the Azure API
     */
    private validateDeployment;
    /**
     * Using an ARM template, provision a bunch of resources
     */
    private createDeployment;
    private createApp;
    /**
     * For more information about this api, please refer to this doc: https://docs.microsoft.com/en-us/rest/api/resources/Tenants/List
     */
    private getTenantId;
    /**
     * Provision a set of Azure resources for use with a bot
     */
    create(name: string, location: string, environment: string, appPassword: string, createLuisResource?: boolean, createLuisAuthoringResource?: boolean, createCosmosDb?: boolean, createStorage?: boolean, createAppInsights?: boolean): Promise<any>;
}
