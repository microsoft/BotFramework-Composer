// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import formatMessage from 'format-message';
import md5 from 'md5';
import { readJson, pathExists, writeJson } from 'fs-extra';
import { Debugger } from 'debug';
import {
  IBotProject,
  PublishPlugin,
  JSONSchema7,
  IExtensionRegistration,
  PublishResponse,
  PublishResult,
} from '@botframework-composer/types';
import { isUsingAdaptiveRuntime, parseRuntimeKey, applyPublishingProfileToSettings } from '@bfc/shared';

import { authConfig, ResourcesItem } from '../types';

import { AzureResourceTypes, AzureResourceDefinitions } from './resourceTypes';
import { mergeDeep } from './mergeDeep';
import { BotProjectDeploy, getAbsSettings } from './deploy';
import { BotProjectProvision } from './provision';
import { BackgroundProcessManager } from './backgroundProcessManager';
import { ProvisionConfig } from './provision';
import schema from './schema';
import { stringifyError } from './utils/errorHandler';
import { ProcessStatus } from './types';

// This option controls whether the history is serialized to a file between sessions with Composer
// set to TRUE for history to be saved to disk
// set to FALSE for history to be cached in memory only
const PERSIST_HISTORY = false;
const getProvisionLogName = (name: string) => `provision.${name}.log`;
const instructions = `To create a publish configuration, follow the instructions in the README file in your bot project folder.`;

interface DeployResources {
  name: string;
  environment: string;
  accessToken: string;
  hostname?: string;
  luisResource?: string;
  subscriptionID: string;
  abs?: any;
}

interface PublishConfig {
  fullSettings: any;
  profileName: string; //profile name
  [key: string]: any;
}

interface ProvisionHistoryItem {
  profileName: string;
  jobId: string; // use for unique each provision
  projectId: string;
  time: Date;
  log: string[];
}

function publishResultFromStatus(procStatus: ProcessStatus): PublishResponse {
  const { status, message, log, comment, time } = procStatus;

  return {
    status,
    result: {
      message,
      log: log.map((item) => `---\n${JSON.stringify(item, null, 2)}\n---\n`).join('\n'),
      comment,
      time: time.toString(),
      id: procStatus.id,
      status,
    },
  };
}

// Wrap the entire class definition in the export so the composer object can be available to it
export default async (composer: IExtensionRegistration): Promise<void> => {
  class AzurePublisher implements PublishPlugin<PublishConfig> {
    private historyFilePath: string;
    private publishHistories: Record<string, Record<string, PublishResult[]>>; // use botId profileName as key
    private provisionHistories: Record<string, Record<string, ProcessStatus>>;
    public schema: JSONSchema7;
    public instructions: string;
    public name: string;
    public description: string;
    public logger: Debugger;
    public hasView = true;
    public bundleId = 'publish'; /** host custom UI */

    constructor(name: string, description: string, bundleId: string) {
      this.publishHistories = {};
      this.provisionHistories = {};
      this.historyFilePath = path.resolve(__dirname, '../../publishHistory.txt');
      if (PERSIST_HISTORY) {
        this.loadHistoryFromFile();
      }
      this.schema = schema;
      this.instructions = instructions;
      this.name = name;
      this.description = description;
      this.logger = composer.log;
      this.bundleId = bundleId;
    }

    /*******************************************************************************************************************************/
    /* These methods deal with the publishing history displayed in the Composer UI */
    /*******************************************************************************************************************************/
    private async loadHistoryFromFile() {
      if (await pathExists(this.historyFilePath)) {
        this.publishHistories = await readJson(this.historyFilePath);
      }
    }

    private history = (botId: string, profileName: string): PublishResult[] => {
      if (this.publishHistories?.[botId]?.[profileName]) {
        return this.publishHistories[botId][profileName];
      }
      return [];
    };

    private updateHistory = async (botId: string, profileName: string, newHistory: PublishResult) => {
      if (!this.publishHistories[botId]) {
        this.publishHistories[botId] = {};
      }
      if (!this.publishHistories[botId][profileName]) {
        this.publishHistories[botId][profileName] = [];
      }
      this.publishHistories[botId][profileName].unshift(newHistory);
      if (PERSIST_HISTORY) {
        await writeJson(this.historyFilePath, this.publishHistories);
      }
    };

    private persistProvisionHistory = async (jobId: string, profileName: string, logPath: string) => {
      const currentStatus = BackgroundProcessManager.getStatus(jobId);
      const curr: ProvisionHistoryItem = {
        profileName: profileName,
        jobId: jobId,
        projectId: currentStatus.projectId,
        time: currentStatus.time,
        log: currentStatus.log,
      };
      await writeJson(logPath, curr, { spaces: 2 });
    };

    /*******************************************************************************************************************************/
    /* These methods implement the publish actions */
    /*******************************************************************************************************************************/
    /**

    /**
     * Take the project from a given folder, build it, and push it to Azure.
     * @param project
     * @param runtime
     * @param botId
     * @param profileName
     * @param jobId
     * @param resourcekey
     * @param customizeConfiguration
     */
    private performDeploymentAction = async (
      project: IBotProject,
      settings: any,
      runtime: any,
      botId: string,
      profileName: string,
      jobId: string,
      resourcekey: string,
      customizeConfiguration: DeployResources
    ) => {
      const { subscriptionID, accessToken, name, environment, hostname, luisResource, abs } = customizeConfiguration;

      const mode = this.getRuntimeTemplateMode(runtime?.key);

      // Create the BotProjectDeploy object, which is used to carry out the deploy action.
      const azDeployer = new BotProjectDeploy({
        logger: (msg: any, ...args: any[]) => {
          this.logger(msg, ...args);
          if (msg?.message) {
            BackgroundProcessManager.updateProcess(jobId, 202, msg.message.replace(/\n$/, ''));
          }
        },
        accessToken: accessToken,
        projPath: project.getRuntimePath(),
        runtime: runtime,
      });

      // Perform the deploy
      await azDeployer.deploy(project, settings, profileName, name, environment, hostname, luisResource, abs);

      // If we've made it this far, the deploy succeeded!
      BackgroundProcessManager.updateProcess(jobId, 200, 'Success');

      // update status and history
      // get the latest status
      const status = BackgroundProcessManager.getStatus(jobId);
      // add it to the history
      await this.updateHistory(botId, profileName, publishResultFromStatus(status).result);
      // clean up the background process
      BackgroundProcessManager.removeProcess(jobId);
    };

    /*******************************************************************************************************************************/
    /* These methods deploy bot to azure async */
    /*******************************************************************************************************************************/
    // move the init folder and publsih together and not wait in publish method. because init folder take a long time
    private asyncPublish = async (config: PublishConfig, project, resourcekey, jobId) => {
      const {
        // these are provided by Composer
        fullSettings, // all the bot's settings - includes sensitive values not included in projet.settings
        profileName, // the name of the publishing profile "My re Prod Slot"

        // these are specific to the azure publish profile shape
        subscriptionID,
        name,
        environment,
        hostname,
        luisResource,
        settings, // these are the settings from inside the publishing profile
        accessToken,
        luResources,
        qnaResources,
        abs,
      } = config;
      try {
        // get the appropriate runtime template which contains methods to build and configure the runtime
        const runtime = composer.getRuntimeByProject(project);
        // set runtime code path as runtime template folder path

        // Merge all the settings
        // this combines the bot-wide settings, the environment specific settings, and 2 new fields needed for deployed bots
        // these will be written to the appropriate settings file inside the appropriate runtime plugin.
        const mergedSettings = mergeDeep(applyPublishingProfileToSettings(fullSettings, config), {
          luResources,
          qnaResources,
        });

        // Prepare parameters and then perform the actual deployment action
        const customizeConfiguration: DeployResources = {
          accessToken,
          subscriptionID,
          name,
          environment,
          hostname,
          luisResource,
          abs,
        };
        await this.performDeploymentAction(
          project,
          mergedSettings,
          runtime,
          project.id,
          profileName,
          jobId,
          resourcekey,
          customizeConfiguration
        );
      } catch (err) {
        this.logger('%O', err);
        BackgroundProcessManager.updateProcess(jobId, 500, stringifyError(err));
        await this.updateHistory(
          project.id,
          profileName,
          publishResultFromStatus(BackgroundProcessManager.getStatus(jobId)).result
        );
        BackgroundProcessManager.removeProcess(jobId);
      }
    };

    /*******************************************************************************************************************************/
    /* These methods provision resources to azure async */
    /*******************************************************************************************************************************/
    asyncProvision = async (jobId: string, config: ProvisionConfig, project: IBotProject, user): Promise<void> => {
      const { subscription, name } = config;
      // Create the object responsible for actually taking the provision actions.
      const azureProvisioner = new BotProjectProvision({
        ...config,
        logger: (msg: any) => {
          this.logger(msg);
          BackgroundProcessManager.updateProcess(jobId, 202, msg.message);
        },
      });

      // perform the provision using azureProvisioner.create.
      // this will start the process, then return.
      // However, the process will continue in the background
      const provisionResults = await azureProvisioner.create(config);

      // cast this into the right form for a publish profile
      let currentProfile = null;
      if (config.currentProfile) {
        currentProfile = JSON.parse(config.currentProfile.configuration);
      }
      const currentSettings = currentProfile?.settings;

      const publishProfile = {
        name: currentProfile?.name ?? config.hostname,
        environment: currentProfile?.environment ?? 'composer',
        tenantId: provisionResults?.tenantId ?? currentProfile?.tenantId,
        subscriptionId: provisionResults.subscriptionId ?? currentProfile?.subscriptionId,
        resourceGroup: currentProfile?.resourceGroup ?? provisionResults.resourceGroup?.name,
        botName: currentProfile?.botName ?? provisionResults.botName,
        hostname: config.hostname ?? currentProfile?.hostname,
        luisResource: provisionResults.luisPrediction ? `${config.hostname}-luis` : currentProfile?.luisResource,
        runtimeIdentifier: currentProfile?.runtimeIdentifier ?? 'win-x64',
        region: config.location,
        settings: {
          applicationInsights: {
            InstrumentationKey:
              provisionResults.appInsights?.instrumentationKey ??
              currentSettings?.applicationInsights?.InstrumentationKey,
          },
          cosmosDb: provisionResults.cosmosDB ?? currentSettings?.cosmosDb,
          blobStorage: provisionResults.blobStorage ?? currentSettings?.blobStorage,
          luis: {
            authoringKey: provisionResults.luisAuthoring?.authoringKey ?? currentSettings?.luis?.authoringKey,
            authoringEndpoint:
              provisionResults.luisAuthoring?.authoringEndpoint ?? currentSettings?.luis?.authoringEndpoint,
            endpointKey: provisionResults.luisPrediction?.endpointKey ?? currentSettings?.luis?.endpointKey,
            endpoint: provisionResults.luisPrediction?.endpoint ?? currentSettings?.luis?.endpoint,
            region: provisionResults.luisPrediction?.location ?? currentSettings?.luis?.region,
          },
          qna: {
            subscriptionKey: provisionResults.qna?.subscriptionKey ?? currentSettings?.qna?.subscriptionKey,
            qnaRegion: provisionResults.qna?.region ?? currentSettings?.qna?.qnaRegion,
          },
          MicrosoftAppId: provisionResults.appId ?? currentSettings?.MicrosoftAppId,
          MicrosoftAppPassword: provisionResults.appPassword ?? currentSettings?.MicrosoftAppPassword,
        },
      };
      for (const configUnit in currentProfile) {
        if (!(configUnit in publishProfile)) {
          publishProfile[configUnit] = currentProfile[configUnit];
        }
      }

      this.logger(publishProfile);

      if (provisionResults.success) {
        BackgroundProcessManager.updateProcess(jobId, 200, 'Provisioning completed successfully!', publishProfile);
      } else {
        const partialSuccess = provisionResults.provisionedCount > 0;
        const errorCode = partialSuccess ? 206 : 500;
        let message = `${provisionResults.errorMessage}. See ${getProvisionLogName(name)} in your bot folder`;
        if (partialSuccess) {
          message = `Provisioning completed ${provisionResults.provisionedCount} items before encountering a problem. ${message}`;
        }
        BackgroundProcessManager.updateProcess(jobId, errorCode, message, partialSuccess ? publishProfile : undefined);
      }
      // save provision history to log file.
      const provisionHistoryPath = path.resolve(project.dataDir, getProvisionLogName(name));
      await this.persistProvisionHistory(jobId, name, provisionHistoryPath);

      // add in history
      this.addProvisionHistory(project.id, config.name, BackgroundProcessManager.getStatus(jobId));
      BackgroundProcessManager.removeProcess(jobId);
    };

    /**************************************************************************************************
     * plugin methods for publish
     *************************************************************************************************/
    publish = async (config: PublishConfig, project: IBotProject, metadata, user, getAccessToken) => {
      const {
        // these are provided by Composer
        profileName, // the name of the publishing profile "My Azure Prod Slot"

        // these are specific to the azure publish profile shape
        name,
        environment = 'composer',
        settings,
      } = config;

      const abs = getAbsSettings(config);
      const { luResources, qnaResources } = metadata;

      // get the bot id from the project
      const botId = project.id;

      // generate an id to track this deploy
      const jobId = BackgroundProcessManager.startProcess(
        202,
        project.id,
        profileName,
        'Accepted for publishing...',
        metadata.comment
      );

      // resource key to map to one provision resource
      const resourcekey = md5([project.name, name, environment].join());

      try {
        // verify the profile has been provisioned at least once
        if (!this.isProfileProvisioned(config)) {
          throw new Error(
            formatMessage(
              'There was a problem publishing {projectName}/{profileName}. The profile has not been provisioned yet.',
              { projectName: project.name, profileName }
            )
          );
        }

        // verify the publish profile has the required resources configured
        const resources = await this.getResources(project, user);

        const missingResourceNames = resources.reduce((result, resource) => {
          if (resource.required && !this.isResourceProvisionedInProfile(resource, config)) {
            result.push(resource.text);
          }
          return result;
        }, []);

        if (missingResourceNames.length > 0) {
          const missingResourcesText = missingResourceNames.join(',');
          throw new Error(
            formatMessage(
              'There was a problem publishing {projectName}/{profileName}. These required resources have not been provisioned: {missingResourcesText}',
              { projectName: project.name, profileName, missingResourcesText }
            )
          );
        }

        // authenticate with azure
        const accessToken = config.accessToken || (await getAccessToken(authConfig.arm));

        // test creds, if not valid, return 500
        if (!accessToken) {
          throw new Error('Required field `accessToken` is missing from publishing profile.');
        }
        if (!settings) {
          throw new Error('Required field `settings` is missing from publishing profile.');
        }

        this.asyncPublish({ ...config, accessToken, luResources, qnaResources, abs }, project, resourcekey, jobId);

        return publishResultFromStatus(BackgroundProcessManager.getStatus(jobId));
      } catch (err) {
        this.logger('%O', err);
        // can only can accessToken and settings missing. Because asyncPublish is not await.
        BackgroundProcessManager.updateProcess(jobId, 500, stringifyError(err));
        const status = publishResultFromStatus(BackgroundProcessManager.getStatus(jobId));
        await this.updateHistory(botId, profileName, status.result);
        BackgroundProcessManager.removeProcess(jobId);
        return status;
      }
    };

    getHistory = async (config: PublishConfig, project: IBotProject, user) => {
      const profileName = config.profileName;
      const botId = project.id;
      return this.history(botId, profileName);
    };

    getStatus = async (config: PublishConfig, project: IBotProject, user) => {
      const profileName = config.profileName;
      const botId = project.id;
      // get status by Job ID first.
      if (config.jobId) {
        const status = BackgroundProcessManager.getStatus(config.jobId);
        if (status) {
          return publishResultFromStatus(status);
        }
      } else {
        // If job id was not present or failed to resolve the status, use the pid and profileName
        const status = BackgroundProcessManager.getStatusByName(project.id, profileName);
        if (status) {
          return publishResultFromStatus(status);
        }
      }
      // if ACTIVE status is found, look for recent status in history
      const current = this.history(botId, profileName);
      if (current.length > 0) {
        return {
          status: current[0].status,
          result: current[0],
        };
      }
      // finally, return a 404 if not found at all
      return {
        status: 404,
        result: {
          message: 'bot not published',
        },
      };
    };

    /**************************************************************************************************
     * plugin methods for provision
     *************************************************************************************************/
    provision = async (config: any, project: IBotProject, user, getAccessToken): Promise<ProcessStatus> => {
      const jobId = BackgroundProcessManager.startProcess(202, project.id, config.name, 'Creating Azure resources...');
      this.asyncProvision(jobId, config, project, user);
      return BackgroundProcessManager.getStatus(jobId);
    };

    getProvisionStatus = async (
      processName: string,
      project: IBotProject,
      user,
      jobId = ''
    ): Promise<ProcessStatus> => {
      const botId = project.id;
      // get status by Job ID first.
      if (jobId) {
        const status = BackgroundProcessManager.getStatus(jobId);
        if (status) {
          return status;
        }
      } else {
        // If job id was not present or failed to resolve the status, use the pid and profileName
        const status = BackgroundProcessManager.getStatusByName(botId, processName);
        if (status) {
          return status;
        }
      }

      // if ACTIVE status is found, look for recent status in history
      return this.getProvisionHistory(botId, processName);
    };

    getResources = async (project: IBotProject, user): Promise<ResourcesItem[]> => {
      const recommendedResources: ResourcesItem[] = [];

      const { runtimeType } = parseRuntimeKey(project.settings?.runtime?.key);

      // add in the ALWAYS REQUIRED options

      // Always need an app registration (app id and password)
      recommendedResources.push({
        ...AzureResourceDefinitions[AzureResourceTypes.APP_REGISTRATION],
        required: true,
      });

      // always need hosting compute - either web app or functions
      if (runtimeType === 'functions') {
        recommendedResources.push({
          ...AzureResourceDefinitions[AzureResourceTypes.AZUREFUNCTIONS],
          required: true,
        });
      } else {
        recommendedResources.push({
          ...AzureResourceDefinitions[AzureResourceTypes.WEBAPP],
          required: true,
        });
      }

      // Always need a bot service registration
      recommendedResources.push({
        ...AzureResourceDefinitions[AzureResourceTypes.BOT_REGISTRATION],
        required: true,
      });

      // Now add in optional items
      recommendedResources.push({
        ...AzureResourceDefinitions[AzureResourceTypes.COSMOSDB],
        required: false,
      });
      recommendedResources.push({
        ...AzureResourceDefinitions[AzureResourceTypes.APPINSIGHTS],
        required: false,
      });
      recommendedResources.push({
        ...AzureResourceDefinitions[AzureResourceTypes.BLOBSTORAGE],
        required: false,
      });

      // TODO: determine if QNA or LUIS is REQUIRED or OPTIONAL
      const requireLUIS = false;
      const requireQNA = false;

      recommendedResources.push({
        ...AzureResourceDefinitions[AzureResourceTypes.LUIS_AUTHORING],
        required: requireLUIS,
      });

      recommendedResources.push({
        ...AzureResourceDefinitions[AzureResourceTypes.LUIS_PREDICTION],
        required: requireLUIS,
      });

      recommendedResources.push({
        ...AzureResourceDefinitions[AzureResourceTypes.QNA],
        required: requireQNA,
      });

      return recommendedResources;
    };

    private isProfileProvisioned = (profile: PublishConfig): boolean => {
      //TODO: Post-migration we can check for profile?.tenantId
      return profile?.resourceGroup && profile?.subscriptionId && profile?.region;
    };

    // While the provisioning process may return more information for various resources than is checked here,
    // this tries to verify the minimum settings are present and that cannot be empty strings.
    private isResourceProvisionedInProfile = (resource: ResourcesItem, profile: PublishConfig): boolean => {
      switch (resource.key) {
        case AzureResourceTypes.APPINSIGHTS:
          // InstrumentationKey is Pascal-cased for some unknown reason
          return profile?.settings?.applicationInsights?.InstrumentationKey;
        case AzureResourceTypes.APP_REGISTRATION:
          // MicrosoftAppId and MicrosoftAppPassword are Pascal-cased for some unknown reason
          return profile?.settings?.MicrosoftAppId && profile?.settings?.MicrosoftAppPassword;
        case AzureResourceTypes.BLOBSTORAGE:
          // name is not checked (not in schema.ts)
          // container property is not checked (empty may be a valid value)
          return profile?.settings?.blobStorage?.connectionString;
        case AzureResourceTypes.BOT_REGISTRATION:
          return profile?.botName;
        case AzureResourceTypes.COSMOSDB:
          // collectionId is not checked (not in schema.ts)
          // databaseId and containerId are not checked (empty may be a valid value)
          return profile?.settings?.cosmosDB?.authKey && profile?.settings?.cosmosDB?.cosmosDBEndpoint;
        case AzureResourceTypes.LUIS_AUTHORING:
          // region is not checked (empty may be a valid value)
          return profile?.settings?.luis?.authoringKey && profile?.settings?.luis?.authoringEndpoint;
        case AzureResourceTypes.LUIS_PREDICTION:
          // region is not checked (empty may be a valid value)
          return profile?.settings?.luis?.endpointKey && profile?.settings?.luis?.endpoint;
        case AzureResourceTypes.QNA:
          // endpoint is not checked (it is in schema.ts and provision() returns the value, but it is not set in the config)
          // qnaRegion is not checked (empty may be a valid value)
          return profile?.settings?.qna?.subscriptionKey;
        case AzureResourceTypes.SERVICE_PLAN:
          // no settings exist to verify the service plan was created
          return true;
        case AzureResourceTypes.AZUREFUNCTIONS:
        case AzureResourceTypes.WEBAPP:
          return profile?.hostname;
        default:
          throw new Error(
            formatMessage('Azure resource type {resourceKey} is not handled.', { resourceKey: resource.key })
          );
      }
    };

    private addProvisionHistory = (botId: string, profileName: string, newValue: ProcessStatus) => {
      if (!this.provisionHistories[botId]) {
        this.provisionHistories[botId] = {};
      }
      this.provisionHistories[botId][profileName] = newValue;
    };

    private getProvisionHistory = (botId: string, profileName: string) => {
      if (this.provisionHistories?.[botId]?.[profileName]) {
        return this.provisionHistories[botId][profileName];
      }
      return {
        id: '',
        projectId: botId,
        processName: profileName,
        time: new Date(),
        log: [],
        status: 500,
        message: 'not found',
      } as ProcessStatus;
    };
  }

  const azurePublish = new AzurePublisher('azurePublish', 'Publish bot to Azure (Preview)', 'azurePublish');

  await composer.addPublishMethod(azurePublish);
};
