// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { QnAFile } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { qnaUtil } from '@bfc/indexers';

import qnaWorker from '../parsers/qnaWorker';
import {
  qnaFilesState,
  qnaAllUpViewStatusState,
  projectIdState,
  localeState,
  settingsState,
  showCreateQnAFromScratchDialogState,
  showCreateQnAFromUrlDialogState,
  onCreateQnAFromScratchDialogCompleteState,
  onCreateQnAFromUrlDialogCompleteState,
} from '../atoms/botState';
import { QnAAllUpViewStatus } from '../types';
import qnaFileStatusStorage from '../../utils/qnaFileStatusStorage';
import { getBaseName } from '../../utils/fileUtil';
import { navigateTo } from '../../utils/navigation';

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

/**
 * id can be
 * 1. dialogId, no locale
 * 2. qna file id, with locale
 * 3. source qna file id, no locale
 */
export const removeQnAFileState = async (callbackHelpers: CallbackInterface, { id }: { id: string }) => {
  const { set, snapshot } = callbackHelpers;
  let qnaFiles = await snapshot.getPromise(qnaFilesState);
  const projectId = await snapshot.getPromise(projectIdState);
  const locale = await snapshot.getPromise(localeState);

  const targetQnAFile =
    qnaFiles.find((item) => item.id === id) || qnaFiles.find((item) => item.id === `${id}.${locale}`);
  if (!targetQnAFile) {
    throw new Error(`remove qna file ${id} not exist`);
  }

  qnaFiles.forEach((file) => {
    if (file.id === targetQnAFile.id) {
      qnaFileStatusStorage.removeFileStatus(projectId, targetQnAFile.id);
    }
  });

  qnaFiles = qnaFiles.filter((file) => file.id !== targetQnAFile.id);
  set(qnaFilesState, qnaFiles);
};

export const createKBFileState = async (
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

  let newQnAFiles = [...qnaFiles];

  // if created on a dialog, need update this dialog's all locale qna ref
  if (id.includes('.source') === false) {
    const updatedQnAId = id;
    if (!qnaFiles.find((f) => f.id === updatedQnAId)) {
      throw new Error(`update qna file ${updatedQnAId}.qna not exist`);
    }

    newQnAFiles = qnaFiles.map((file) => {
      if (!file.id.endsWith('.source') && getBaseName(file.id) === getBaseName(updatedQnAId)) {
        return qnaUtil.addImport(file, `${createdSourceQnAId}.qna`);
      }
      return file;
    });

    qnaFileStatusStorage.updateFileStatus(projectId, updatedQnAId);
  }

  qnaFileStatusStorage.updateFileStatus(projectId, createdSourceQnAId);
  set(qnaFilesState, [createdQnAFile, ...newQnAFiles]);
};

export const removeKBFileState = async (callbackHelpers: CallbackInterface, { id }: { id: string }) => {
  const { set, snapshot } = callbackHelpers;
  let qnaFiles = await snapshot.getPromise(qnaFilesState);
  const projectId = await snapshot.getPromise(projectIdState);
  const locale = await snapshot.getPromise(localeState);

  const targetQnAFile =
    qnaFiles.find((item) => item.id === id) || qnaFiles.find((item) => item.id === `${id}.${locale}`);
  if (!targetQnAFile) {
    throw new Error(`remove qna container file ${id} not exist`);
  }

  qnaFiles.forEach((file) => {
    if (file.id === targetQnAFile.id) {
      qnaFileStatusStorage.removeFileStatus(projectId, targetQnAFile.id);
    }
  });

  qnaFiles = qnaFiles.filter((file) => file.id !== targetQnAFile.id);
  set(qnaFilesState, qnaFiles);
};

export const renameKBFileState = async (
  callbackHelpers: CallbackInterface,
  { id, name }: { id: string; name: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const qnaFiles = await snapshot.getPromise(qnaFilesState);
  const projectId = await snapshot.getPromise(projectIdState);
  const locale = await snapshot.getPromise(localeState);

  const targetQnAFile =
    qnaFiles.find((item) => item.id === id) || qnaFiles.find((item) => item.id === `${id}.${locale}`);
  if (!targetQnAFile) {
    throw new Error(`rename qna container file ${id} not exist`);
  }

  const existQnAFile =
    qnaFiles.find((item) => item.id === name) || qnaFiles.find((item) => item.id === `${name}.${locale}`);
  if (existQnAFile) {
    throw new Error(`rename qna container file to ${name} already exist`);
  }
  qnaFileStatusStorage.removeFileStatus(projectId, targetQnAFile.id);

  const newQnAFiles = qnaFiles.map((file) => {
    if (file.id === targetQnAFile.id) {
      return {
        ...file,
        id: name,
      };
    }
    return file;
  });

  set(qnaFilesState, newQnAFiles);
};

export const qnaDispatcher = () => {
  const createQnAFromUrlDialogBegin = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      dialogId,
      onComplete,
    }: {
      dialogId?: string;
      onComplete?: Function;
    }) => {
      if (dialogId) {
        const projectId = await snapshot.getPromise(projectIdState);
        navigateTo(`/bot/${projectId}/knowledge-base/${dialogId}`);
      }
      set(showCreateQnAFromUrlDialogState, true);
      set(onCreateQnAFromUrlDialogCompleteState, { func: onComplete });
    }
  );

  const createQnAFromUrlDialogCancel = useRecoilCallback(({ set }: CallbackInterface) => () => {
    set(showCreateQnAFromUrlDialogState, false);
    set(onCreateQnAFromUrlDialogCompleteState, { func: undefined });
  });

  const createQnAFromScratchDialogBegin = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      dialogId,
      onComplete,
    }: {
      dialogId?: string;
      onComplete?: Function;
    }) => {
      // navigate to all up view scratch.
      if (dialogId) {
        const projectId = await snapshot.getPromise(projectIdState);
        navigateTo(`/bot/${projectId}/knowledge-base/${dialogId}`);
      }

      set(showCreateQnAFromScratchDialogState, true);
      set(onCreateQnAFromScratchDialogCompleteState, { func: onComplete });
    }
  );

  const createQnAFromScratchDialogCancel = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (dialogId?: string) => {
      // navigate back to design page. if click `Back`
      if (dialogId) {
        const projectId = await snapshot.getPromise(projectIdState);
        navigateTo(`/bot/${projectId}/dialogs/${dialogId}`);
      }
      set(showCreateQnAFromScratchDialogState, false);
      set(onCreateQnAFromScratchDialogCompleteState, { func: undefined });
    }
  );

  const createQnAFromUrlDialogSuccess = useRecoilCallback(({ set, snapshot }: CallbackInterface) => async () => {
    const onCreateQnAFromUrlDialogComplete = (await snapshot.getPromise(onCreateQnAFromUrlDialogCompleteState)).func;
    if (typeof onCreateQnAFromUrlDialogComplete === 'function') {
      onCreateQnAFromUrlDialogComplete(null);
    }
    set(showCreateQnAFromUrlDialogState, false);
    set(onCreateQnAFromUrlDialogCompleteState, { func: undefined });
  });

  const createQnAFromScratchDialogSuccess = useRecoilCallback(({ set, snapshot }: CallbackInterface) => async () => {
    const onCreateQnAFromScratchDialogComplete = (await snapshot.getPromise(onCreateQnAFromScratchDialogCompleteState))
      .func;
    if (typeof onCreateQnAFromScratchDialogComplete === 'function') {
      onCreateQnAFromScratchDialogComplete(null);
    }
    set(showCreateQnAFromScratchDialogState, false);
    set(onCreateQnAFromScratchDialogCompleteState, { func: undefined });
  });

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

  const removeQnAFile = useRecoilCallback((callbackHelpers: CallbackInterface) => async ({ id }: { id: string }) => {
    await removeQnAFileState(callbackHelpers, { id });
  });

  const dismissCreateQnAModal = useRecoilCallback(({ set }: CallbackInterface) => async () => {
    set(showCreateQnAFromUrlDialogState, false);
    set(showCreateQnAFromScratchDialogState, false);
  });

  const createQnAKBFromUrl = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      name,
      url,
      multiTurn,
    }: {
      id: string; // dialogId.locale
      name: string;
      url: string;
      multiTurn: boolean;
    }) => {
      const { set } = callbackHelpers;
      await dismissCreateQnAModal();
      set(qnaAllUpViewStatusState, QnAAllUpViewStatus.Loading);
      let response;
      try {
        response = await httpClient.get(`/utilities/qna/parse`, {
          params: { url: encodeURIComponent(url), multiTurn },
        });
      } catch (err) {
        setError(callbackHelpers, err);
        set(qnaAllUpViewStatusState, QnAAllUpViewStatus.Success);
        return;
      }

      const contentForSourceQnA = `> !# @source.url=${url}
> !# @source.multiTurn=${multiTurn}
${response.data}
`;

      await createKBFileState(callbackHelpers, {
        id,
        name,
        content: contentForSourceQnA,
      });

      await createQnAFromUrlDialogSuccess();
      set(qnaAllUpViewStatusState, QnAAllUpViewStatus.Success);
    }
  );

  const createQnAKBFromScratch = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      name,
    }: {
      id: string; // dialogId.locale
      name: string;
    }) => {
      await dismissCreateQnAModal();

      const projectId = await callbackHelpers.snapshot.getPromise(projectIdState);
      const content = qnaUtil.generateQnAPair();
      await createKBFileState(callbackHelpers, {
        id,
        name,
        content,
      });
      await createQnAFromScratchDialogSuccess();

      navigateTo(`/bot/${projectId}/knowledge-base/${getBaseName(id)}?C=${encodeURIComponent(name)}.source`);
    }
  );

  const updateQnAQuestion = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      id,
      sectionId,
      questionId,
      content,
    }: {
      id: string;
      sectionId: string;
      questionId: string;
      content: string;
    }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState);
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      // const updatedFile = await updateQnAFileState(callbackHelpers, { id, content });
      const updatedFile = qnaUtil.updateQnAQuestion(qnaFile, sectionId, questionId, content);
      set(qnaFilesState, (qnaFiles) => {
        return qnaFiles.map((file) => {
          return file.id === id ? updatedFile : file;
        });
      });
    }
  );

  const updateQnAAnswer = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      id,
      sectionId,
      content,
    }: {
      id: string;
      sectionId: string;
      content: string;
    }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState);
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.updateQnAAnswer(qnaFile, sectionId, content);
      set(qnaFilesState, (qnaFiles) => {
        return qnaFiles.map((file) => {
          return file.id === id ? updatedFile : file;
        });
      });
    }
  );

  const createQnAQuestion = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      id,
      sectionId,
      content,
    }: {
      id: string;
      sectionId: string;
      content: string;
    }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState);
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.createQnAQuestion(qnaFile, sectionId, content);
      set(qnaFilesState, (qnaFiles) => {
        return qnaFiles.map((file) => {
          return file.id === id ? updatedFile : file;
        });
      });
    }
  );

  const removeQnAQuestion = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      id,
      sectionId,
      questionId,
    }: {
      id: string;
      sectionId: string;
      questionId: string;
    }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState);
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.removeQnAQuestion(qnaFile, sectionId, questionId);
      set(qnaFilesState, (qnaFiles) => {
        return qnaFiles.map((file) => {
          return file.id === id ? updatedFile : file;
        });
      });
    }
  );

  const createQnAPairs = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({ id, content }: { id: string; content: string }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState);
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      // insert into head, need investigate
      const updatedFile = qnaUtil.insertSection(qnaFile, 0, content);
      set(qnaFilesState, (qnaFiles) => {
        return qnaFiles.map((file) => {
          return file.id === id ? updatedFile : file;
        });
      });
    }
  );

  const removeQnAPairs = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({ id, sectionId }: { id: string; sectionId: string }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState);
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.removeSection(qnaFile, sectionId);
      set(qnaFilesState, (qnaFiles) => {
        return qnaFiles.map((file) => {
          return file.id === id ? updatedFile : file;
        });
      });
    }
  );

  const createQnAImport = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({ id, sourceId }: { id: string; sourceId: string }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState);
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.addImport(qnaFile, `${sourceId}.qna`);
      set(qnaFilesState, (qnaFiles) => {
        return qnaFiles.map((file) => {
          return file.id === id ? updatedFile : file;
        });
      });
    }
  );
  const removeQnAImport = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({ id, sourceId }: { id: string; sourceId: string }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState);
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.removeImport(qnaFile, `${sourceId}.qna`);
      set(qnaFilesState, (qnaFiles) => {
        return qnaFiles.map((file) => {
          return file.id === id ? updatedFile : file;
        });
      });
    }
  );
  const removeQnAKB = useRecoilCallback((callbackHelpers: CallbackInterface) => async ({ id }: { id: string }) => {
    await removeKBFileState(callbackHelpers, { id });
  });
  const renameQnAKB = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, name }: { id: string; name: string }) => {
      await renameKBFileState(callbackHelpers, { id, name });
    }
  );

  return {
    createQnAImport,
    removeQnAImport,
    createQnAPairs,
    removeQnAPairs,
    createQnAQuestion,
    removeQnAQuestion,
    updateQnAQuestion,
    updateQnAAnswer,
    createQnAFile,
    removeQnAFile,
    updateQnAFile,
    removeQnAKB,
    renameQnAKB,
    createQnAKBFromUrl,
    createQnAKBFromScratch,
    createQnAFromScratchDialogBegin,
    createQnAFromScratchDialogCancel,
    createQnAFromUrlDialogBegin,
    createQnAFromUrlDialogCancel,
  };
};
