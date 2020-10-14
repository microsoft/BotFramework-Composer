// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { defaultPublishConfig, IPublishConfig } from '@bfc/shared';
import { selector, selectorFamily } from 'recoil';

import settingsStorage from '../../utils/dialogSettingStorage';
import { BotStatus } from '../../constants';
import { isAbsHosted } from '../../utils/envUtil';
import { luFilesState, qnaFilesState, settingsState } from '../atoms';
import { Dispatcher } from '../dispatchers';
import { dispatcherState } from '../DispatcherWrapper';
import { isBuildConfigComplete, needsBuild } from '../../utils/buildUtil';

import { validateDialogSelectorFamily } from './validatedDialogs';

export const botBuildRequiredSelector = selectorFamily({
  key: 'botBuildRequiredSelector',
  get: (projectId: string) => ({ get }) => {
    const dialogs = get(validateDialogSelectorFamily(projectId));
    return !isAbsHosted() && needsBuild(dialogs);
  },
});

export const isBuildConfigCompleteSelector = selectorFamily({
  key: 'isBuildConfigCompleteSelector',
  get: (projectId: string) => ({ get }) => {
    const settings = get(settingsState(projectId));
    const config = {
      luis: settings.luis,
      qna: settings.qna,
    };
    const dialogs = get(validateDialogSelectorFamily(projectId));
    const luFiles = get(luFilesState(projectId));
    const qnaFiles = get(qnaFilesState(projectId));

    return {
      isBuildConfigComplete: isBuildConfigComplete(config, dialogs, luFiles, qnaFiles),
      config,
    };
  },
});

const botRuntimeAction = (dispatcher: Dispatcher) => {
  return {
    buildWithDefaultRecognizer: async (projectId: string, config: IPublishConfig) => {
      if (config) {
        dispatcher.setBotStatus(projectId, BotStatus.publishing);
        await dispatcher.build(config.luis, config.qna, projectId);
      }
    },
    startBot: async (projectId, config?: IPublishConfig) => {
      dispatcher.setBotStatus(projectId, BotStatus.reloading);
      if (config?.qna?.subscriptionKey && !config?.qna?.endpointKey) {
        await dispatcher.setQnASettings(projectId, config.qna.subscriptionKey);
      }

      const sensitiveSettings = settingsStorage.get(projectId);
      await dispatcher.publishToTarget(projectId, defaultPublishConfig, { comment: '' }, sensitiveSettings);
    },
    stop: async (projectId: string) => {
      dispatcher.stopPublishBot(projectId);
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
