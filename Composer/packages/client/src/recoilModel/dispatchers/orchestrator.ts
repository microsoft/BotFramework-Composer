// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { RecognizerFile, SDKKinds } from '@bfc/shared';
import { CallbackInterface, useRecoilCallback } from 'recoil';
import partition from 'lodash/partition';

import { orchestratorDownloadNotificationProps } from '../../components/Orchestrator/DownloadNotification';
import httpClient from '../../utils/httpUtil';
import { dispatcherState } from '../../../src/recoilModel';
import { recognizersSelectorFamily } from '../selectors/recognizers';
import { Locales } from '../../locales';

import { createNotification } from './notification';

export const downloadModel = (addr: string, model: 'en' | 'multilang') => {
  return new Promise<boolean>((resolve, reject) => {
    httpClient.post(addr, { language: model }).then((resp) => {
      if (resp.status !== 200) {
        reject(false);
      }

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

export const availableLanguageModels = (recognizerFiles: RecognizerFile[]) => {
  const dialogsUsingOrchestrator = recognizerFiles.filter(
    ({ id, content }) => content.$kind === SDKKinds.OrchestratorRecognizer
  );
  const languageModels: ('en' | 'multilang')[] = [];
  if (dialogsUsingOrchestrator.length) {
    // pull out languages that Orchestrator has to support
    const [enLuFiles, multiLangLuFiles] = partition(dialogsUsingOrchestrator, (f) =>
      f.id.split('.')?.[1]?.toLowerCase()?.startsWith('en')
    );

    if (enLuFiles.length) {
      languageModels.push('en');
    }

    if (
      multiLangLuFiles
        .map((r) => r.id.split('.')?.[1])
        .filter((id) => id !== undefined)
        .some((lang) => Locales.map((l) => l.locale).includes(lang?.toLowerCase()))
    ) {
      languageModels.push('multilang');
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
      addNotification(notification);

      try {
        for (const languageModel of availableLanguageModels(recognizers)) {
          await downloadModel('/orchestrator/download', languageModel);
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
