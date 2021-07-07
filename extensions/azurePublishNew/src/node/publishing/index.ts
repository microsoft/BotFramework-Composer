// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as path from 'path';

import { IBotProject, RuntimeTemplate, UserIdentity } from '@botframework-composer/types';
import { PublishConfig } from '@bfc/extension-client';

import { GetAccessToken } from '../types';

import { OnPublishProgress } from './types';
import { authConfig } from './utils/authUtils';
import { applyPublishingProfileToSettings, mergeDeep } from './utils/settingsUtils';
import { bindToKeyVaultStep } from './bindKeyVaultStep';
import { buildRecognizerStep } from './buildRecognizerStep';
import { cleanBuildStep } from './cleanBuildStep';
import { createZipStep } from './createZipStep';
import { deployZipStep } from './deployZipStep';
import { linkBotToAppStep } from './linkBotToAppStep';
import { updateSkillManifestsStep } from './updateSkillManifestsStep';
import { buildRuntimeStep } from './buildRuntimeStep';
import { publishRecognizerStep } from './publishRecognizerStep';
import { verifyProvisionedStep } from './verifyProvisionedStep';

export const publish = async (
  config: PublishConfig,
  project: IBotProject,
  runtimeTemplate: RuntimeTemplate,
  metadata: any,
  user: UserIdentity,
  getAccessToken: GetAccessToken,
  onProgress: OnPublishProgress
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
  const botName = config.botName ?? resourceId.match(/botServices\/([^/]*)/)[1];
  const luisConfig = settings.luis;
  const projectPath = project.getRuntimePath();
  const qnaConfig = settings.qna;
  const runtime = settings.runtime;
  const subscriptionId = config.subscriptionId ?? resourceId.match(/subscriptions\/([\w-]*)\//)[1];
  const resourceGroupName = config.resourceGroup ?? resourceId.match(/resourceGroups\/([^/]*)/)[1];
  const zipPath = config.zipPath ?? path.join(projectPath, 'code.zip');

  if (!accessToken) {
    throw new Error('The access token for authentication could not be acquired.');
  }
  if (!settings) {
    throw new Error('The settings are missing from the publishing profile.');
  }

  //TODO: Re-enable this step.
  //await verifyProvisionedStep({ publishConfig: config, project }, onProgress);

  // Merge all the settings
  // this combines the bot-wide settings, the environment specific settings, and 2 new fields needed for deployed bots
  // these will be written to the appropriate settings file inside the appropriate runtime plugin.
  const mergedSettings = mergeDeep(applyPublishingProfileToSettings(fullSettings, config), {
    luResources,
    qnaResources,
  });

  // Update skill host endpoint
  if (mergedSettings?.skill && Object.keys(mergedSettings?.skill).length > 0) {
    mergedSettings.skillHostEndpoint = `https://${hostname}.azurewebsites.net/api/skills`;
  }

  await linkBotToAppStep({ accessToken, botName, hostname, resourceGroupName, subscriptionId }, onProgress);
  await bindToKeyVaultStep(
    {
      accessToken,
      appPasswordHint,
      email,
      hostname,
    },
    onProgress
  );
  await cleanBuildStep({ zipPath }, onProgress);
  await buildRecognizerStep(
    { luResources, project, luisConfig, projectPath, qnaConfig, qnaResources, runtime },
    onProgress
  );
  const { luisAppIds } = await publishRecognizerStep(
    { accessToken, environment, luisConfig, luisResource, name, projectPath },
    onProgress
  );
  const { pathToArtifacts, settings: postBuildSettings } = await buildRuntimeStep(
    { luisAppIds, project, projectPath, profileName, runtimeTemplate, settings: mergedSettings },
    onProgress
  );
  await updateSkillManifestsStep({ appId, hostname, pathToArtifacts, profileName, project }, onProgress);
  await createZipStep({ appSettings: postBuildSettings, sourcePath: pathToArtifacts, zipPath }, onProgress);
  await deployZipStep({ accessToken, environment, hostname, name, zipPath }, onProgress);
};
