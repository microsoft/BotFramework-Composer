// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { QnAFile } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { qnaUtil } from '@bfc/indexers';

import qnaWorker from '../parsers/qnaWorker';
import {
  qnaFilesState,
  settingsState,
  showCreateQnAFromScratchDialogState,
  showCreateQnAFromUrlDialogState,
  onCreateQnAFromScratchDialogCompleteState,
  onCreateQnAFromUrlDialogCompleteState,
} from '../atoms/botState';
import { createQnAOnState } from '../atoms/appState';
import qnaFileStatusStorage from '../../utils/qnaFileStatusStorage';
import { getBaseName } from '../../utils/fileUtil';
import { navigateTo } from '../../utils/navigation';
import {
  getQnaFailedNotification,
  getQnaSuccessNotification,
  getQnaPendingNotification,
} from '../../utils/notifications';
import httpClient from '../../utils/httpUtil';
import { rootBotProjectIdSelector } from '../selectors';

import { addNotificationInternal, deleteNotificationInternal, createNotification } from './notification';

export const updateQnAFileState = async (
  callbackHelpers: CallbackInterface,
  { id, content, projectId }: { id: string; content: string; projectId: string }
) => {
  const { set, snapshot } = callbackHelpers;
  //To do: support other languages on qna
  id = `${getBaseName(id)}.en-us`;
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
  //const locale = await snapshot.getPromise(localeState(projectId));
  //To do: support other languages on qna
  const locale = 'en-us';
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

/**
 * id can be
 * 1. dialogId, no locale
 * 2. qna file id, with locale
 * 3. source qna file id, no locale
 */
export const removeQnAFileState = async (
  callbackHelpers: CallbackInterface,
  { id, projectId }: { id: string; projectId: string }
) => {
  const { set, snapshot } = callbackHelpers;
  let qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
  //const locale = await snapshot.getPromise(localeState(projectId));
  //To do: support other languages on qna
  const locale = 'en-us';

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
  set(qnaFilesState(projectId), qnaFiles);
};

export const createKBFileState = async (
  callbackHelpers: CallbackInterface,
  { id, name, content, projectId }: { id: string; name: string; content: string; projectId: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
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
  set(qnaFilesState(projectId), [createdQnAFile, ...newQnAFiles]);
};

export const removeKBFileState = async (
  callbackHelpers: CallbackInterface,
  { id, projectId }: { id: string; projectId: string }
) => {
  const { set, snapshot } = callbackHelpers;
  let qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
  // const locale = await snapshot.getPromise(localeState(projectId));
  //To do: support other languages on qna
  const locale = 'en-us';

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
  set(qnaFilesState(projectId), qnaFiles);
};

export const renameKBFileState = async (
  callbackHelpers: CallbackInterface,
  { id, name, projectId }: { id: string; name: string; projectId: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
  //const locale = await snapshot.getPromise(localeState(projectId));
  //To do: support other languages
  const locale = 'en-us';

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

  set(qnaFilesState(projectId), newQnAFiles);
};

export const qnaDispatcher = () => {
  const createQnAFromUrlDialogBegin = useRecoilCallback(
    ({ set }: CallbackInterface) => async ({
      onComplete,
      projectId,
      dialogId,
    }: {
      onComplete?: () => void;
      projectId: string;
      dialogId: string;
    }) => {
      set(createQnAOnState, { projectId, dialogId });
      set(showCreateQnAFromUrlDialogState(projectId), true);
      set(onCreateQnAFromUrlDialogCompleteState(projectId), { func: onComplete });
    }
  );

  const createQnAFromUrlDialogCancel = useRecoilCallback(
    ({ set }: CallbackInterface) => ({ projectId }: { projectId: string }) => {
      set(createQnAOnState, { projectId: '', dialogId: '' });
      set(showCreateQnAFromUrlDialogState(projectId), false);
      set(onCreateQnAFromUrlDialogCompleteState(projectId), { func: undefined });
    }
  );

  const createQnAFromScratchDialogBegin = useRecoilCallback(
    ({ set }: CallbackInterface) => async ({
      onComplete,
      projectId,
      dialogId,
    }: {
      onComplete?: () => void;
      projectId: string;
      dialogId: string;
    }) => {
      set(createQnAOnState, { projectId, dialogId });
      set(showCreateQnAFromScratchDialogState(projectId), true);
      set(onCreateQnAFromScratchDialogCompleteState(projectId), { func: onComplete });
    }
  );

  const createQnAFromScratchDialogBack = useRecoilCallback(
    ({ set }: CallbackInterface) => async ({ projectId }: { projectId: string }) => {
      set(showCreateQnAFromScratchDialogState(projectId), false);
      set(onCreateQnAFromScratchDialogCompleteState(projectId), { func: undefined });
    }
  );

  const createQnAFromScratchDialogCancel = useRecoilCallback(
    ({ set }: CallbackInterface) => async ({ projectId }: { projectId: string }) => {
      set(createQnAOnState, { projectId: '', dialogId: '' });
      set(showCreateQnAFromScratchDialogState(projectId), false);
      set(onCreateQnAFromScratchDialogCompleteState(projectId), { func: undefined });
    }
  );

  const createQnAFromUrlDialogSuccess = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({ projectId }: { projectId: string }) => {
      const onCreateQnAFromUrlDialogComplete = (
        await snapshot.getPromise(onCreateQnAFromUrlDialogCompleteState(projectId))
      ).func;
      if (typeof onCreateQnAFromUrlDialogComplete === 'function') {
        onCreateQnAFromUrlDialogComplete();
      }
      set(showCreateQnAFromUrlDialogState(projectId), false);
      set(onCreateQnAFromUrlDialogCompleteState(projectId), { func: undefined });
    }
  );

  const createQnAFromScratchDialogSuccess = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({ projectId }: { projectId: string }) => {
      const onCreateQnAFromScratchDialogComplete = (
        await snapshot.getPromise(onCreateQnAFromScratchDialogCompleteState(projectId))
      ).func;
      if (typeof onCreateQnAFromScratchDialogComplete === 'function') {
        onCreateQnAFromScratchDialogComplete();
      }
      set(showCreateQnAFromScratchDialogState(projectId), false);
      set(onCreateQnAFromScratchDialogCompleteState(projectId), { func: undefined });
    }
  );

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

  const removeQnAFile = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, projectId }: { id: string; projectId: string }) => {
      await removeQnAFileState(callbackHelpers, { id, projectId });
    }
  );

  const dismissCreateQnAModal = useRecoilCallback(
    ({ set }: CallbackInterface) => async ({ projectId }: { projectId: string }) => {
      set(showCreateQnAFromUrlDialogState(projectId), false);
      set(showCreateQnAFromScratchDialogState(projectId), false);
    }
  );

  const createQnAKBFromUrl = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      name,
      url,
      multiTurn,
      projectId,
    }: {
      id: string; // dialogId.locale
      name: string;
      url: string;
      multiTurn: boolean;
      projectId: string;
    }) => {
      //To do: support other languages on qna
      id = `${getBaseName(id)}.en-us`;
      await dismissCreateQnAModal({ projectId });
      const notification = createNotification(getQnaPendingNotification(url));
      addNotificationInternal(callbackHelpers, notification);

      let response;
      try {
        response = await httpClient.get(`/utilities/qna/parse`, {
          params: { url: encodeURIComponent(url), multiTurn },
        });
        const content = response.data;

        await updateQnAFileState(callbackHelpers, { id, content, projectId });
        const rootBotProjectId = await callbackHelpers.snapshot.getPromise(rootBotProjectIdSelector);
        const notification = createNotification(
          getQnaSuccessNotification(() => {
            navigateTo(
              rootBotProjectId === projectId
                ? `/bot/${projectId}/knowledge-base/${getBaseName(id)}`
                : `/bot/${rootBotProjectId}/skill/${projectId}/knowledge-base/${getBaseName(id)}`
            );
            deleteNotificationInternal(callbackHelpers, notification.id);
          })
        );
        addNotificationInternal(callbackHelpers, notification);
      } catch (err) {
        addNotificationInternal(
          callbackHelpers,
          createNotification(getQnaFailedNotification(err.response?.data?.message))
        );
        createQnAFromUrlDialogCancel({ projectId });
        return;
      } finally {
        deleteNotificationInternal(callbackHelpers, notification.id);
      }

      const contentForSourceQnA = `> !# @source.url=${url}
> !# @source.multiTurn=${multiTurn}
${response.data}
`;

      await createKBFileState(callbackHelpers, {
        id,
        name,
        content: contentForSourceQnA,
        projectId,
      });

      await createQnAFromUrlDialogSuccess({ projectId });
    }
  );

  const createQnAKBFromScratch = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      name,
      projectId,
      content = '',
    }: {
      id: string; // dialogId.locale
      name: string;
      content?: string;
      projectId: string;
    }) => {
      //To do: support other languages on qna
      id = `${getBaseName(id)}.en-us`;
      await dismissCreateQnAModal({ projectId });

      await createKBFileState(callbackHelpers, {
        id,
        name,
        content,
        projectId,
      });
      await createQnAFromScratchDialogSuccess({ projectId });
      const rootBotProjectId = await callbackHelpers.snapshot.getPromise(rootBotProjectIdSelector);
      const notification = createNotification(
        getQnaSuccessNotification(() => {
          navigateTo(
            rootBotProjectId === projectId
              ? `/bot/${projectId}/knowledge-base/${getBaseName(id)}`
              : `/bot/${rootBotProjectId}/skill/${projectId}/knowledge-base/${getBaseName(id)}`
          );
          deleteNotificationInternal(callbackHelpers, notification.id);
        })
      );
      addNotificationInternal(callbackHelpers, notification);
    }
  );

  const updateQnAQuestion = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      id,
      sectionId,
      questionId,
      content,
      projectId,
    }: {
      id: string;
      sectionId: string;
      questionId: string;
      content: string;
      projectId: string;
    }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      // const updatedFile = await updateQnAFileState(callbackHelpers, { id, content });
      const updatedFile = qnaUtil.updateQnAQuestion(qnaFile, sectionId, questionId, content);
      set(qnaFilesState(projectId), (qnaFiles) => {
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
      projectId,
    }: {
      id: string;
      sectionId: string;
      content: string;
      projectId: string;
    }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.updateQnAAnswer(qnaFile, sectionId, content);
      set(qnaFilesState(projectId), (qnaFiles) => {
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
      projectId,
    }: {
      id: string;
      sectionId: string;
      content: string;
      projectId: string;
    }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.createQnAQuestion(qnaFile, sectionId, content);
      set(qnaFilesState(projectId), (qnaFiles) => {
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
      projectId,
    }: {
      id: string;
      sectionId: string;
      questionId: string;
      projectId: string;
    }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.removeQnAQuestion(qnaFile, sectionId, questionId);
      set(qnaFilesState(projectId), (qnaFiles) => {
        return qnaFiles.map((file) => {
          return file.id === id ? updatedFile : file;
        });
      });
    }
  );

  const createQnAPairs = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      id,
      content,
      projectId,
    }: {
      id: string;
      content: string;
      projectId: string;
    }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      // insert into head, need investigate
      const updatedFile = qnaUtil.insertSection(qnaFile, 0, content);
      set(qnaFilesState(projectId), (qnaFiles) => {
        return qnaFiles.map((file) => {
          return file.id === id ? updatedFile : file;
        });
      });
    }
  );

  const removeQnAPairs = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      id,
      sectionId,
      projectId,
    }: {
      id: string;
      sectionId: string;
      projectId: string;
    }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.removeSection(qnaFile, sectionId);
      set(qnaFilesState(projectId), (qnaFiles) => {
        return qnaFiles.map((file) => {
          return file.id === id ? updatedFile : file;
        });
      });
    }
  );

  const createQnAImport = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      id,
      sourceId,
      projectId,
    }: {
      id: string;
      sourceId: string;
      projectId: string;
    }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.addImport(qnaFile, `${sourceId}.qna`);
      set(qnaFilesState(projectId), (qnaFiles) => {
        return qnaFiles.map((file) => {
          return file.id === id ? updatedFile : file;
        });
      });
    }
  );
  const removeQnAImport = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      id,
      sourceId,
      projectId,
    }: {
      id: string;
      sourceId: string;
      projectId: string;
    }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.removeImport(qnaFile, `${sourceId}.qna`);
      set(qnaFilesState(projectId), (qnaFiles) => {
        return qnaFiles.map((file) => {
          return file.id === id ? updatedFile : file;
        });
      });
    }
  );
  const updateQnAImport = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async ({
      id,
      sourceId,
      newSourceId,
      projectId,
    }: {
      id: string;
      sourceId: string;
      newSourceId: string;
      projectId: string;
    }) => {
      const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      let updatedFile = qnaUtil.removeImport(qnaFile, `${sourceId}.qna`);
      updatedFile = qnaUtil.addImport(updatedFile, `${newSourceId}.qna`);
      set(qnaFilesState(projectId), (qnaFiles) => {
        return qnaFiles.map((file) => {
          return file.id === id ? updatedFile : file;
        });
      });
    }
  );
  const removeQnAKB = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, projectId }: { id: string; projectId: string }) => {
      await removeKBFileState(callbackHelpers, { id, projectId });
    }
  );
  const renameQnAKB = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      name,
      projectId,
    }: {
      id: string;
      name: string;
      projectId: string;
    }) => {
      await renameKBFileState(callbackHelpers, { id, name, projectId });
    }
  );

  return {
    createQnAImport,
    removeQnAImport,
    updateQnAImport,
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
    createQnAFromScratchDialogBack,
    createQnAFromScratchDialogCancel,
    createQnAFromUrlDialogBegin,
    createQnAFromUrlDialogCancel,
  };
};
