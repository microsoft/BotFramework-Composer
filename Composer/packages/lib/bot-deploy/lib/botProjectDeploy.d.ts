import { BotProjectDeployConfig } from './botProjectDeployConfig';
export declare class BotProjectDeploy {
  private subId;
  private accessToken;
  private creds;
  private projPath;
  private deploymentSettingsPath;
  private deployFilePath;
  private zipPath;
  private publishFolder;
  private settingsPath;
  private templatePath;
  private dotnetProjectPath;
  private generatedFolder;
  private remoteBotPath;
  private logger;
  private tenantId;
  constructor(config: BotProjectDeployConfig);
  private getErrorMesssage;
  private pack;
  /**
   * For more information about this api, please refer to this doc: https://docs.microsoft.com/en-us/rest/api/resources/Tenants/List
   */
  private getTenantId;
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
   * Write updated settings back to the settings file
   */
  private updateDeploymentJsonFile;
  private getFiles;
  private botPrepareDeploy;
  private dotnetPublish;
  private zipDirectory;
  private notEmptyLuisModel;
  private publishLuis;
  /**
   * Deploy a bot to a location
   */
  deploy(
    name: string,
    luisAuthoringKey?: string,
    luisAuthoringRegion?: string,
    botPath?: string,
    language?: string,
    hostname?: string,
    luisResource?: string
  ): Promise<void>;
  private getAccount;
  private deployZip;
  /**
   * Provision a set of Azure resources for use with a bot
   */
  create(
    name: string,
    location: string,
    appId: string,
    appPassword: string,
    createLuisResource?: boolean,
    createLuisAuthoringResource?: boolean,
    createCosmosDb?: boolean,
    createStorage?: boolean,
    createAppInsignts?: boolean
  ): Promise<{}>;
  /**
   * createAndDeploy
   * provision the Azure resources AND deploy a bot to those resources
   */
  createAndDeploy(
    name: string,
    location: string,
    appId: string,
    appPassword: string,
    luisAuthoringKey?: string,
    luisAuthoringRegion?: string
  ): Promise<void>;
}
//# sourceMappingURL=botProjectDeploy.d.ts.map
