// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { QnAFile } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';

import qnaWorker from '../parsers/qnaWorker';
import { qnaFilesState, localeState, settingsState } from '../atoms/botState';
import qnaFileStatusStorage from '../../utils/qnaFileStatusStorage';
import { getBaseName } from '../../utils/fileUtil';
import { navigateTo } from '../../utils/navigation';
import {
  getQnaFailedNotification,
  getQnaSuccessNotification,
  getQnaPendingNotification,
} from '../../utils/notifications';
import httpClient from '../../utils/httpUtil';

import { addNotificationInternal, deleteNotificationInternal, createNotifiction } from './notification';

export const updateQnAFileState = async (
  callbackHelpers: CallbackInterface,
  { id, content, projectId }: { id: string; content: string; projectId: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
  const updatedQnAFile = (await qnaWorker.parse(id, content)) as QnAFile;
  const newQnAFiles = qnaFiles.map((file) => {
    if (file.id === id) {
      return updatedQnAFile;
    }
    return file;
  });

  set(qnaFilesState(projectId), newQnAFiles);
};

export const createQnAFileState = async (
  callbackHelpers: CallbackInterface,
  { id, content, projectId }: { id: string; content: string; projectId: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
  const locale = await snapshot.getPromise(localeState(projectId));
  const { languages } = await snapshot.getPromise(settingsState(projectId));
  const createdQnaId = `${id}.${locale}`;
  const createdQnaFile = (await qnaWorker.parse(id, content)) as QnAFile;
  if (qnaFiles.find((qna) => qna.id === createdQnaId)) {
    throw new Error('qna file already exist');
  }
  const changes: QnAFile[] = [];

  // copy to other locales
  languages.forEach((lang) => {
    const fileId = `${id}.${lang}`;
    qnaFileStatusStorage.updateFileStatus(projectId, fileId);
    changes.push({
      ...createdQnaFile,
      id: fileId,
    });
  });

  set(qnaFilesState(projectId), [...qnaFiles, ...changes]);
};

export const removeQnAFileState = async (
  callbackHelpers: CallbackInterface,
  { id, projectId }: { id: string; projectId: string }
) => {
  const { set, snapshot } = callbackHelpers;
  let qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));

  qnaFiles.forEach((file) => {
    if (getBaseName(file.id) === getBaseName(id)) {
      qnaFileStatusStorage.removeFileStatus(projectId, id);
    }
  });

  qnaFiles = qnaFiles.filter((file) => getBaseName(file.id) !== id);
  set(qnaFilesState(projectId), qnaFiles);
};

export const qnaDispatcher = () => {
  const updateQnAFile = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      content,
      projectId,
    }: {
      id: string;
      content: string;
      projectId: string;
    }) => {
      await updateQnAFileState(callbackHelpers, { id, content, projectId });
    }
  );

  const createQnAFile = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      content,
      projectId,
    }: {
      id: string;
      content: string;
      projectId: string;
    }) => {
      await createQnAFileState(callbackHelpers, { id, content, projectId });
    }
  );

  const importQnAFromUrls = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      urls,
      projectId,
    }: {
      id: string;
      urls: string[];
      projectId: string;
    }) => {
      const { snapshot } = callbackHelpers;
      const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
      const qnaFile = qnaFiles.find((f) => f.id === id);

      const notification = createNotifiction(getQnaPendingNotification(urls));
      addNotificationInternal(callbackHelpers, notification);

      try {
        const response = await httpClient.get(`/utilities/qna/parse`, {
          params: { urls: encodeURIComponent(urls.join(',')) },
        });
        const content = qnaFile ? qnaFile.content + '\n' + response.data : response.data;

        await updateQnAFileState(callbackHelpers, { id, content, projectId });
        const notification = createNotifiction(
          getQnaSuccessNotification(() => {
            navigateTo(`/bot/${projectId}/knowledge-base/${getBaseName(id)}`);
            deleteNotificationInternal(callbackHelpers, notification.id);
          })
        );
        addNotificationInternal(callbackHelpers, notification);
      } catch (err) {
        addNotificationInternal(
          callbackHelpers,
          createNotifiction(getQnaFailedNotification(err.response?.data?.message))
        );
      } finally {
        deleteNotificationInternal(callbackHelpers, notification.id);
      }
    }
  );

  return {
    createQnAFile,
    updateQnAFile,
    importQnAFromUrls,
  };
};
