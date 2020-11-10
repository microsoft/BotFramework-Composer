// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defaultPublishConfig, IPublishConfig } from '@bfc/shared';
import { selector, selectorFamily } from 'recoil';

import settingsStorage from '../../utils/dialogSettingStorage';
import { BotStatus } from '../../constants';
import { isAbsHosted } from '../../utils/envUtil';
import { botDisplayNameState, botStatusState, luFilesState, qnaFilesState, settingsState } from '../atoms';
import { Dispatcher } from '../dispatchers';
import { dispatcherState } from '../DispatcherWrapper';
import { isBuildConfigComplete as isBuildConfigurationComplete, needsBuild } from '../../utils/buildUtil';

import { validateDialogsSelectorFamily } from './validatedDialogs';
import { localBotsWithoutErrorsSelector } from './project';

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
    const dialogs = get(validateDialogsSelectorFamily(projectId));
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
    const dialogs = get(validateDialogsSelectorFamily(projectId));
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
    return localProjects.map((projectId: string) => {
      const result = get(buildEssentialsSelector(projectId));
      const name = get(botDisplayNameState(projectId));
      const dialogs = get(validateDialogsSelectorFamily(projectId));
      return { ...result, name, dialogs };
    });
  },
});

export const runningBotsSelector = selector({
  key: 'runningBotsSelector',
  get: ({ get }) => {
    const localProjects = get(localBotsWithoutErrorsSelector);
    const botsRunning = localProjects.filter((projectId: string) => {
      const result = get(botStatusState(projectId));
      return result === BotStatus.connected;
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
        dispatcher.setBotStatus(projectId, BotStatus.publishing);
        await dispatcher.build(projectId, config.luis, config.qna);
      }
    },
    startBot: async (projectId: string, config?: IPublishConfig) => {
      dispatcher.setBotStatus(projectId, BotStatus.reloading);

      // TODO: This code will be removed when endpoint keys are obtained for new qna configs
      if (typeof config?.qna?.subscriptionKey === 'string' && config.qna.subscriptionKey && !config?.qna?.endpointKey) {
        await dispatcher.setQnASettings(projectId, config?.qna?.subscriptionKey);
      }

      const sensitiveSettings = settingsStorage.get(projectId);
      await dispatcher.publishToTarget(projectId, defaultPublishConfig, { comment: '' }, sensitiveSettings);
    },
    stopBot: async (projectId: string) => {
      dispatcher.stopPublishBot(projectId);
      dispatcher.setBotStatus(projectId, BotStatus.unConnected);
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
