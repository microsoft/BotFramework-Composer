// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { DialogSetting, RecognizerFile, SDKKinds } from '@bfc/shared';
import { CallbackInterface, useRecoilCallback } from 'recoil';
import partition from 'lodash/partition';

import { orchestratorDownloadNotificationProps } from '../../components/Orchestrator/DownloadNotification';
import httpClient from '../../utils/httpUtil';
import { dispatcherState } from '../../../src/recoilModel';
import { recognizersSelectorFamily } from '../selectors/recognizers';
import { Locales } from '../../locales';

import { createNotification } from './notification';
import { settingsState } from '../atoms';

interface IModelQueueItem {
  type: 'en_intent' | 'multilingual_intent';
  name: string;
}

export const downloadModel = (addr: string, model: IModelQueueItem, notificationStartCallback: () => void) => {
  return new Promise<boolean>((resolve, reject) => {
    httpClient.post(addr, { modelData: model }).then((resp) => {
      if (resp.status === 201) {
        resolve(true);
        return;
      }

      if (resp.status !== 200) {
        reject(false);
        return;
      }

      notificationStartCallback();

      const statusUri = resp.data;

      const timer = setInterval(async () => {
        const resp = await httpClient.get(statusUri);

        if (resp.status === 200 && resp.data < 2) {
          clearInterval(timer);
          resolve(true);
        }
      }, 1000);
    });
  });
};

export const availableLanguageModels = (recognizerFiles: RecognizerFile[], botSettings: DialogSetting) => {
  const dialogsUsingOrchestrator = recognizerFiles.filter(
    ({ id, content }) => content.$kind === SDKKinds.OrchestratorRecognizer
  );
  const languageModels: IModelQueueItem[] = [];
  if (dialogsUsingOrchestrator.length) {
    // pull out languages that Orchestrator has to support
    const [enLuFiles, multiLangLuFiles] = partition(dialogsUsingOrchestrator, (f) =>
      f.id.split('.')?.[1]?.toLowerCase()?.startsWith('en')
    );

    if (enLuFiles.length) {
      languageModels.push({ type: 'en_intent', name: botSettings?.orchestrator?.modelNames?.en_intent ?? 'default' });
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
      });
    }
  }
  return languageModels;
};

export const orchestratorDispatcher = () => {
  const downloadLanguageModels = useRecoilCallback(({ snapshot }: CallbackInterface) => async (projectId: string) => {
    const recognizers = await snapshot.getPromise(recognizersSelectorFamily(projectId));

    const isUsingOrchestrator = recognizers.some(
      ({ id, content }) => content.$kind === SDKKinds.OrchestratorRecognizer
    );

    if (isUsingOrchestrator) {
      // Download Model Notification
      const { addNotification, deleteNotification } = await snapshot.getPromise(dispatcherState);
      const notification = createNotification(orchestratorDownloadNotificationProps());
      const botSettings = await snapshot.getPromise(settingsState(projectId));

      try {
        for (const languageModel of availableLanguageModels(recognizers, botSettings)) {
          await downloadModel('/orchestrator/download', languageModel, () => {
            addNotification(notification);
          });
        }
      } finally {
        deleteNotification(notification.id);
      }
    }
  });

  return {
    downloadLanguageModels,
  };
};
