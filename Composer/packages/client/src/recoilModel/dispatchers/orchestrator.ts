// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { SDKKinds } from '@bfc/shared';
import { CallbackInterface, useRecoilCallback } from 'recoil';

import { orchestratorDownloadNotificationProps } from '../../components/Orchestrator/DownloadNotification';
import httpClient from '../../utils/httpUtil';
import { dispatcherState } from '../../../src/recoilModel';
import { recognizersSelectorFamily } from '../selectors/recognizers';

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

export const orchestratorDispatcher = () => {
  const downloadLanguageModels = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (projectId: string) => {
      const recognizers = await snapshot.getPromise(recognizersSelectorFamily(projectId));

      const isUsingOrchestrator = recognizers.some(
        ({ id, content }) => content.$kind === SDKKinds.OrchestratorRecognizer
      );

      if (isUsingOrchestrator) {
        // pull out languages that Orchestrator has to support
        const botLanguages = recognizers
          .filter(({ id, content }) => content.$kind === SDKKinds.OrchestratorRecognizer)
          .map(({ id, content }) => id.split('.')?.[1]);

        const languageModels: ('en' | 'multilang')[] = [];
        if (botLanguages.some((l) => l?.startsWith('en'))) {
          languageModels.push('en');
        }

        // TODO: We need to get a table of Orchestrator supported languages
        if (botLanguages.length > 1) {
          languageModels.push('multilang');
        }

        // Add Notification of downloading
        const { addNotification, deleteNotification } = await snapshot.getPromise(dispatcherState);
        const notification = createNotification(orchestratorDownloadNotificationProps());
        addNotification(notification);

        try {
          for (const languageModel of languageModels) {
            await downloadModel('/orchestrator/download', languageModel);
          }
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
