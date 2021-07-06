// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogSetting, PublishProfile } from '@botframework-composer/types';

export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

export function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

/**
 * Apply a publishing profile to the base settings, resulting in a "ready to run" version of the settings
 * for the new adaptive runtime. This function transforms the profile settings format to match the new
 * Adaptive Runtime settings form.
 * @param settings
 * @param profile
 * @returns
 */
export const applyPublishingProfileToSettings = (settings: DialogSetting, profile: PublishProfile): DialogSetting => {
  // ensure the runtimeSettings key exists
  settings.runtimeSettings = settings.runtimeSettings || {};

  // apply the application insights resource from the publish profile
  // to the telemetry setting
  if (
    profile.settings.applicationInsights?.InstrumentationKey ||
    profile.settings.applicationInsights?.connectionString
  ) {
    settings.runtimeSettings.telemetry = {
      ...settings.runtimeSettings.telemetry,
      options: {
        connectionString: profile.settings.applicationInsights.connectionString,
        instrumentationKey: profile.settings.applicationInsights.InstrumentationKey,
      },
    };
  }

  // apply the blob storage resource from the publish profile
  // to the blobTranscript feature option
  if (profile.settings.blobStorage?.connectionString) {
    settings.runtimeSettings.features = {
      ...settings.runtimeSettings.features,
      blobTranscript: {
        connectionString: profile.settings.blobStorage.connectionString,
        containerName: profile.settings.blobStorage.container,
      },
      setSpeak: {
        ...settings.runtimeSettings.features?.setSpeak,
      },
    };
  }

  // apply the cosmosDb resource to the storage setting
  if (profile.settings.cosmosDb?.authKey) {
    settings.runtimeSettings.storage = 'CosmosDbPartitionedStorage';
    settings.CosmosDbPartitionedStorage = { ...profile.settings.cosmosDb };
  }

  // apply LUIS settings
  if (profile.settings.luis) {
    settings.luis = {
      ...settings.luis,
      ...profile.settings.luis,
    };
  }

  // apply QNA settings
  if (profile.settings.qna) {
    settings.qna = {
      ...settings.qna,
      ...profile.settings.qna,
    };
  }

  // apply the app id and password
  settings.MicrosoftAppId = profile.settings.MicrosoftAppId;
  settings.MicrosoftAppPassword = profile.settings.MicrosoftAppPassword;

  return settings;
};
