// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { QnAFile } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';

import qnaWorker from '../parsers/qnaWorker';
import { qnaFilesState, qnaAllUpViewStatusState, projectIdState, localeState, settingsState } from '../atoms/botState';
import { QnAAllUpViewStatus } from '../types';
import qnaFileStatusStorage from '../../utils/qnaFileStatusStorage';
import { getBaseName } from '../../utils/fileUtil';

import httpClient from './../../utils/httpUtil';
import { setError } from './shared';

export const updateQnAFileState = async (
  callbackHelpers: CallbackInterface,
  { id, content }: { id: string; content: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const qnaFiles = await snapshot.getPromise(qnaFilesState);
  const updatedQnAFile = (await qnaWorker.parse(id, content)) as QnAFile;
  const newQnAFiles = qnaFiles.map((file) => {
    if (file.id === id) {
      return updatedQnAFile;
    }
    return file;
  });

  set(qnaFilesState, newQnAFiles);
};

export const createQnAFileState = async (
  callbackHelpers: CallbackInterface,
  { id, content }: { id: string; content: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const qnaFiles = await snapshot.getPromise(qnaFilesState);
  const projectId = await snapshot.getPromise(projectIdState);
  const locale = await snapshot.getPromise(localeState);
  const { languages } = await snapshot.getPromise(settingsState);
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

  set(qnaFilesState, [...qnaFiles, ...changes]);
};

export const removeQnAFileState = async (callbackHelpers: CallbackInterface, { id }: { id: string }) => {
  const { set, snapshot } = callbackHelpers;
  let qnaFiles = await snapshot.getPromise(qnaFilesState);
  const projectId = await snapshot.getPromise(projectIdState);

  qnaFiles.forEach((file) => {
    if (getBaseName(file.id) === getBaseName(id)) {
      qnaFileStatusStorage.removeFileStatus(projectId, id);
    }
  });

  qnaFiles = qnaFiles.filter((file) => getBaseName(file.id) !== id);
  set(qnaFilesState, qnaFiles);
};

export const qnaDispatcher = () => {
  const updateQnAFile = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, content }: { id: string; content: string }) => {
      await updateQnAFileState(callbackHelpers, { id, content });
    }
  );

  const createQnAFile = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, content }: { id: string; content: string }) => {
      await createQnAFileState(callbackHelpers, { id, content });
    }
  );

  const importQnAFromUrls = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, urls }: { id: string; urls: string[] }) => {
      const { set, snapshot } = callbackHelpers;
      const qnaFiles = await snapshot.getPromise(qnaFilesState);
      const qnaFile = qnaFiles.find((f) => f.id === id);
      set(qnaAllUpViewStatusState, QnAAllUpViewStatus.Loading);
      try {
        const response = await httpClient.get(`/utilities/qna/parse`, {
          params: { urls: encodeURIComponent(urls.join(',')) },
        });
        const content = qnaFile ? qnaFile.content + '\n' + response.data : response.data;

        await updateQnAFileState(callbackHelpers, { id, content });
        set(qnaAllUpViewStatusState, QnAAllUpViewStatus.Success);
      } catch (err) {
        setError(callbackHelpers, err);
      } finally {
        set(qnaAllUpViewStatusState, QnAAllUpViewStatus.Success);
      }
    }
  );

  return {
    createQnAFile,
    updateQnAFile,
    importQnAFromUrls,
  };
};
