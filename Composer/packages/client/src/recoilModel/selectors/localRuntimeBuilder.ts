// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defaultPublishConfig } from '@bfc/shared';
import { selector, selectorFamily } from 'recoil';
import { checkForPVASchema } from '@bfc/shared';

import { BotStatus } from '../../constants';
import { isAbsHosted } from '../../utils/envUtil';
import {
  botDisplayNameState,
  botStatusState,
  dispatcherState,
  luFilesState,
  qnaFilesState,
  schemasState,
  settingsState,
} from '../atoms';
import { Dispatcher } from '../dispatchers';
import { isBuildConfigComplete as isBuildConfigurationComplete, needsBuild } from '../../utils/buildUtil';
import { getSensitiveProperties } from '../dispatchers/utils/project';

import { dialogsSelectorFamily } from './dialogs';
import { localBotsWithoutErrorsSelector, rootBotProjectIdSelector } from './project';

export const trackBotStatusesSelector = selectorFamily({
  key: 'trackBotStatusesSelector',
  get: (trackedProjectIds: string[]) => ({ get }) => {
    if (trackedProjectIds.length === 0) {
      return false;
    }
    const areBotsRunning = trackedProjectIds.find((projectId: string) => {
      const currentStatus = get(botStatusState(projectId));
      return currentStatus !== BotStatus.connected && currentStatus !== BotStatus.failed;
    });
    return areBotsRunning;
  },
});

export const botBuildRequiredSelector = selectorFamily({
  key: 'botBuildRequiredSelector',
  get: (projectId: string) => ({ get }) => {
    const dialogs = get(dialogsSelectorFamily(projectId));
    return !isAbsHosted() && needsBuild(dialogs);
  },
});

export const buildEssentialsSelector = selectorFamily({
  key: 'buildEssentialsSelector',
  get: (projectId: string) => ({ get }) => {
    const settings = get(settingsState(projectId));
    const configuration = {
      luis: settings.luis,
      qna: settings.qna,
    };
    const dialogs = get(dialogsSelectorFamily(projectId));
    const luFiles = get(luFilesState(projectId));
    const qnaFiles = get(qnaFilesState(projectId));
    const buildRequired = get(botBuildRequiredSelector(projectId));
    const status = get(botStatusState(projectId));

    return {
      isConfigurationComplete: isBuildConfigurationComplete(configuration, dialogs, luFiles, qnaFiles),
      configuration,
      buildRequired,
      projectId,
      status,
    };
  },
});

export const buildConfigurationSelector = selector({
  key: 'buildConfigurationSelector',
  get: ({ get }) => {
    const localProjects = get(localBotsWithoutErrorsSelector);
    const rootBotId = get(rootBotProjectIdSelector);

    return localProjects
      .filter((projectId: string) => {
        const schema = get(schemasState(projectId));
        const isPvaBot = !!checkForPVASchema(schema.sdk);
        return !isPvaBot;
      })
      .map((projectId: string) => {
        const result = get(buildEssentialsSelector(projectId));
        const name = get(botDisplayNameState(projectId));
        const dialogs = get(dialogsSelectorFamily(projectId));
        const settings = get(settingsState(projectId));
        let sensitiveSettings = {};
        if (rootBotId) {
          sensitiveSettings = getSensitiveProperties(settings);
        }
        const secrets = {
          msAppId: settings.MicrosoftAppId || '',
          msPassword: settings.MicrosoftAppPassword || '',
        };
        return { ...result, name, dialogs, sensitiveSettings, secrets };
      });
  },
});

export const runningBotsSelector = selector({
  key: 'runningBotsSelector',
  get: ({ get }) => {
    const localProjects = get(localBotsWithoutErrorsSelector);
    const botsRunning = localProjects.filter((projectId: string) => {
      const result = get(botStatusState(projectId));
      return result === BotStatus.connected || result === BotStatus.stopping;
    });
    return {
      totalBots: localProjects.length,
      projectIds: botsRunning,
    };
  },
});

const botRuntimeAction = (dispatcher: Dispatcher) => {
  return {
    buildWithDefaultRecognizer: async (projectId: string, buildDependencies) => {
      const { config } = buildDependencies;
      if (config) {
        await dispatcher.downloadLanguageModels(projectId);
        dispatcher.setBotStatus(projectId, BotStatus.publishing);
        await dispatcher.build(projectId, config.luis, config.qna);
      }
    },
    startBot: async (projectId: string, sensitiveSettings) => {
      dispatcher.setBotStatus(projectId, BotStatus.starting);
      await dispatcher.publishToTarget(projectId, defaultPublishConfig, { comment: '' }, sensitiveSettings);
    },
    stopBot: async (projectId: string) => {
      await dispatcher.stopPublishBot(projectId);
    },
  };
};

export const botRuntimeOperationsSelector = selector({
  key: 'botRuntimeOperationsSelector',
  get: ({ get }) => {
    const dispatcher = get(dispatcherState);
    if (!dispatcher) {
      return undefined;
    }
    return botRuntimeAction(dispatcher);
  },
});
