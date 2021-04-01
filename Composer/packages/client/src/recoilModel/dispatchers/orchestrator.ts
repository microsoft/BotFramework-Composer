// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { DialogSetting, RecognizerFile, SDKKinds } from '@bfc/shared';
import { CallbackInterface, useRecoilCallback } from 'recoil';
import partition from 'lodash/partition';

import {
  orchestratorDownloadErrorProps,
  orchestratorDownloadNotificationProps,
} from '../../components/Orchestrator/DownloadNotification';
import httpClient from '../../utils/httpUtil';
import { dispatcherState } from '../../../src/recoilModel';
import { recognizersSelectorFamily } from '../selectors/recognizers';
import { Locales } from '../../locales';

import { createNotification, updateNotificationInternal } from './notification';
import { settingsState } from '../atoms';

interface IModelQueueItem {
  type: 'en_intent' | 'multilingual_intent';
  name: string;
  path?: string;
}

const pollUntilDone = (predicate: () => Promise<boolean>, pollingIntervalMs: number) =>
  new Promise((resolve, reject) => {
    try {
      const timer = setInterval(async () => {
        if (await predicate()) {
          clearInterval(timer);
          resolve(true);
        }
      }, pollingIntervalMs);
    } catch (err) {
      reject(err);
    }
  });

export const downloadModel = async (addr: string, model: IModelQueueItem, notificationStartCallback: () => void) => {
  const resp = await httpClient.post(addr, { modelData: model });

  // Model has been downloaded before
  if (resp.status === 201) {
    return true;
  }

  notificationStartCallback();

  return await pollUntilDone(async () => (await httpClient.get(resp.data)).data < 2, 5000);
};

export const availableLanguageModels = (recognizerFiles: RecognizerFile[], botSettings: DialogSetting) => {
  const dialogsUsingOrchestrator = recognizerFiles.filter(
    ({ content }) => content.$kind === SDKKinds.OrchestratorRecognizer
  );
  const languageModels: IModelQueueItem[] = [];
  if (dialogsUsingOrchestrator.length) {
    // pull out languages that Orchestrator has to support
    const [enLuFiles, multiLangLuFiles] = partition(dialogsUsingOrchestrator, (f) =>
      f.id.split('.')?.[1]?.toLowerCase()?.startsWith('en')
    );

    if (enLuFiles.length) {
      languageModels.push({
        type: 'en_intent',
        name: botSettings?.orchestrator?.modelNames?.en_intent ?? 'default',
        path: botSettings?.orchestrator?.modelPath,
      });
    }

    if (
      multiLangLuFiles
        .map((r) => r.id.split('.')?.[1])
        .filter((id) => id !== undefined)
        .some((lang) => Locales.map((l) => l.locale).includes(lang?.toLowerCase()))
    ) {
      languageModels.push({
        type: 'multilingual_intent',
        name: botSettings?.orchestrator?.modelNames?.multilingual_intent ?? 'default',
        path: botSettings?.orchestrator?.modelPath,
      });
    }
  }
  return languageModels;
};

export const orchestratorDispatcher = () => {
  const downloadLanguageModels = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId: string) => {
      const { snapshot } = callbackHelpers;

      const recognizers = await snapshot.getPromise(recognizersSelectorFamily(projectId));

      const isUsingOrchestrator = recognizers.some(({ content }) => content.$kind === SDKKinds.OrchestratorRecognizer);

      if (isUsingOrchestrator) {
        // Download Model Notification
        const { addNotification, deleteNotification } = await snapshot.getPromise(dispatcherState);
        const notification = createNotification(orchestratorDownloadNotificationProps());
        const botSettings = await snapshot.getPromise(settingsState(projectId));

        try {
          for (const languageModel of availableLanguageModels(recognizers, botSettings)) {
            await downloadModel('/orchestrator/download', languageModel, () => {
              updateNotificationInternal(callbackHelpers, notification.id, notification);
            });
          }
        } catch (err) {
          addNotification(
            createNotification(orchestratorDownloadErrorProps(err?.response?.data?.message || err.message))
          );
        } finally {
          deleteNotification(notification.id);
        }
      }
    }
  );

  return {
    downloadLanguageModels,
  };
};
