// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';

import md5 from 'md5';
import { AuthParameters, IBotProject, RuntimeTemplate, UserIdentity } from '@botframework-composer/types';

import { PublishConfig } from './types';
import { authConfig } from './constants';
import { applyPublishingProfileToSettings, mergeDeep } from './utils';
import { createLinkBotToAppStep } from './linkBotToAppStep';
import { createBindToKeyVaultStep } from './bindKeyVaultStep';
import { createCleanBuildStep } from './cleanBuildStep';
import { createBuildRecognizerStep } from './buildRecognizerStep';
import { createPublishRecognizerStep } from './publishRecognizerStep';
import { createUpdateSkillManifestStep } from './updateSkillManifestStep';

export type PublishConfig2 = {
  accessToken: string;
  name: string;
  environment: string;
  hostname?: string;
  luisResource?: string;
  profileName: string;
  project: IBotProject;
  subscriptionID: string;

  // These are defined as any from the PublishPlugin interface
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  absSettings?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metdata: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runtime: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: any;

  [key: string]: any;
};

type GetAccessToken = (params: AuthParameters) => Promise<string>;

export const publish = async (
  config: PublishConfig,
  project: IBotProject,
  runtimeTemplate: RuntimeTemplate,
  metadata: any,
  user?: UserIdentity,
  getAccessToken?: GetAccessToken
) => {
  const {
    // from Composer
    fullSettings,
    profileName,

    // azure publish specific
    appPasswordHint,
    email,
    environment = 'composer',
    hostname,
    luisResource,
    name,
    resourceId,
    settings,
  } = config;

  const { luResources, qnaResources } = metadata;

  const accessToken = config.accessToken || (await getAccessToken(authConfig.arm));
  const appId = settings.MicrosoftAppId;
  const botId = project.id;
  const botName = config.botName ?? resourceId.match(/botServices\/([^/]*)/)[1];
  const luisConfig = settings.luis;
  const projectPath = project.getRuntimePath();
  const qnaConfig = settings.qna;
  const resourcekey = md5([project.name, name, environment].join());
  const runtime = settings.runtime;
  const subscriptionId = config.subscriptionId ?? resourceId.match(/subscriptions\/([\w-]*)\//)[1];
  const resourceGroupName = config.resourceGroup ?? resourceId.match(/resourceGroups\/([^/]*)/)[1];
  const zipPath = config.zipPath ?? path.join(projectPath, 'code.zip');

  const absSettings = {
    appPasswordHint,
    subscriptionId,
    resourceGroup: resourceGroupName,
    resourceId,
    botName,
  };

  if (!accessToken) {
    throw new Error('The access token for authentication could not be acquired.');
  }
  if (!settings) {
    throw new Error('Settings field is missing from the pbulishing profile');
  }

  // Merge all the settings
  // this combines the bot-wide settings, the environment specific settings, and 2 new fields needed for deployed bots
  // these will be written to the appropriate settings file inside the appropriate runtime plugin.
  const mergedSettings = mergeDeep(applyPublishingProfileToSettings(fullSettings, config), {
    luResources,
    qnaResources,
  });

  const steps = [
    createLinkBotToAppStep({ accessToken, botName, hostname, resourceGroupName, subscriptionId }),
    createBindToKeyVaultStep({
      accessToken,
      appPasswordHint,
      email,
      hostname,
    }),
    createCleanBuildStep({ zipPath }),
    createBuildRecognizerStep({ luResources, project, luisConfig, projectPath, qnaConfig, qnaResources, runtime }),
    createPublishRecognizerStep({ accessToken, environment, luisResource, luisConfig, name, projectPath }),
    createUpdateSkillManifestStep({ appId, hostname, profileName, project, projectPath }),
  ];

  //link bot to app
  //bind to key vaule
  //update skill host endpoint
  //clean build
  //build luis
  //publish luis
  //update settings
  //build runtime
  //copy manifests
  //create zip
  //deploy zip

  steps.push(createLinkBotToAppStep());
};

// if (absSettings.resourceId) {
//   try {
//     if (!subscriptionId) {
//       subscriptionId = absSettings.resourceId.match(/subscriptions\/([\w-]*)\//)[1];
//     }
//     if (!resourceGroupName) {
//       resourceGroupName = absSettings.resourceId.match(/resourceGroups\/([^/]*)/)[1];
//     }
//     if (!botName) {
//       botName = absSettings.resourceId.match(/botServices\/([^/]*)/)[1];
//     }
//   } catch (error) {
//     this.logger({
//       status: BotProjectDeployLoggerType.DEPLOY_INFO,
//       message: 'Abs settings resourceId is incomplete, skip linking bot with webapp ...',
//     });
//     return;
//   }
// } else {
//   subscriptionId = settings.subscriptionId;
//   resourceGroupName = settings.resourceGroup;
//   botName = settings.botName;
// }
