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

export const createSourceQnAFileState = async (
  callbackHelpers: CallbackInterface,
  { id, name, content }: { id: string; name: string; content: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const projectId = await snapshot.getPromise(projectIdState);
  const qnaFiles = await snapshot.getPromise(qnaFilesState);
  const createdSourceQnAId = `${name}.source`;

  if (qnaFiles.find((qna) => qna.id === createdSourceQnAId)) {
    throw new Error(`source qna file ${createdSourceQnAId}.qna already exist`);
  }

  const createdQnAFile = (await qnaWorker.parse(createdSourceQnAId, content)) as QnAFile;

  const contentForDialogQnA = `[${name}](${createdSourceQnAId}.qna)\n`;

  let newQnAFiles = [...qnaFiles];

  // if created on a dialog, need update this dialog's all locale qna ref
  if (id.includes('.source') === false) {
    const updatedQnAId = id;
    if (!qnaFiles.find((f) => f.id === updatedQnAId)) {
      throw new Error(`update qna file ${updatedQnAId}.qna not exist`);
    }

    newQnAFiles = qnaFiles.map((file) => {
      if (!file.id.endsWith('.source') && getBaseName(file.id) === getBaseName(updatedQnAId)) {
        return {
          ...file,
          content: contentForDialogQnA + file.content,
        };
      }
      return file;
    });

    qnaFileStatusStorage.updateFileStatus(projectId, updatedQnAId);
  }

  qnaFileStatusStorage.updateFileStatus(projectId, createdSourceQnAId);
  set(qnaFilesState, [...newQnAFiles, createdQnAFile]);
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
    (callbackHelpers: CallbackInterface) => async ({
      id,
      name,
      urls,
    }: {
      id: string; // dialogId.locale
      name: string;
      urls: string[];
    }) => {
      const { set } = callbackHelpers;

      set(qnaAllUpViewStatusState, QnAAllUpViewStatus.Loading);

      let response;
      try {
        response = await httpClient.get(`/utilities/qna/parse`, {
          params: { urls: encodeURIComponent(urls.join(',')) },
        });
      } catch (err) {
        setError(callbackHelpers, err);
        set(qnaAllUpViewStatusState, QnAAllUpViewStatus.Success);
        return;
      }

      const contentForSourceQnA = `> !# @source.urls = ${urls}
> !# @source.name = ${name}
${response.data}
`;

      await createSourceQnAFileState(callbackHelpers, {
        id,
        name,
        content: contentForSourceQnA,
      });

      set(qnaAllUpViewStatusState, QnAAllUpViewStatus.Success);
    }
  );

  return {
    createQnAFile,
    updateQnAFile,
    importQnAFromUrls,
  };
};
