// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { QnAFile } from '@bfc/shared';
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { qnaUtil } from '@bfc/indexers';

import qnaWorker from '../parsers/qnaWorker';
import {
  settingsState,
  showCreateQnAFromScratchDialogState,
  showCreateQnAFromUrlDialogState,
  onCreateQnAFromScratchDialogCompleteState,
  onCreateQnAFromUrlDialogCompleteState,
  localeState,
  qnaFileState,
  qnaFileIdsState,
} from '../atoms/botState';
import { createQnAOnState } from '../atoms/appState';
import qnaFileStatusStorage from '../../utils/qnaFileStatusStorage';
import { getBaseName, getKBLocale } from '../../utils/fileUtil';
import { navigateTo } from '../../utils/navigation';
import {
  getQnaFailedNotification,
  getQnaSuccessNotification,
  getQnaPendingNotification,
} from '../../utils/notifications';
import httpClient from '../../utils/httpUtil';
import { qnaFilesSelectorFamily, rootBotProjectIdSelector } from '../selectors';

import { addNotificationInternal, deleteNotificationInternal, createNotification } from './notification';

/**
 * Recoil state from snapshot can be expired, use updater can make fine-gained operations.
 *
 * @param changes files need to update/add/delete
 * @param filter drop some expired changes.
 *
 */

const updateQnaFiles = (
  { set }: CallbackInterface,
  projectId: string,
  changes: {
    adds?: QnAFile[];
    deletes?: QnAFile[];
    updates?: QnAFile[];
  },
  getLatestFile?: (current: QnAFile, changed: QnAFile) => QnAFile
) => {
  const { updates, adds, deletes } = changes;

  // updates
  updates?.forEach((qnaFile) => {
    set(qnaFileState({ projectId, qnaFileId: qnaFile.id }), (oldQnaFile) =>
      getLatestFile ? getLatestFile(oldQnaFile, qnaFile) : qnaFile
    );
  });

  // deletes
  if (deletes?.length) {
    const deletedIds = deletes.map((file) => file.id);
    set(qnaFileIdsState(projectId), (ids) => ids.filter((id) => !deletedIds.includes(id)));
  }

  // adds
  if (adds?.length) {
    const addedIds = adds.map((file) => file.id);
    adds.forEach((qnaFile) => {
      set(qnaFileState({ projectId, qnaFileId: qnaFile.id }), (oldQnaFile) =>
        getLatestFile ? getLatestFile(oldQnaFile, qnaFile) : qnaFile
      );
    });
    set(qnaFileIdsState(projectId), (ids) => [...ids, ...addedIds]);
  }
};

export const updateQnAFileState = async (
  callbackHelpers: CallbackInterface,
  { id, content, projectId }: { id: string; content: string; projectId: string }
) => {
  const updatedQnAFile = (await qnaWorker.parse(id, content)) as QnAFile;

  updateQnaFiles(callbackHelpers, projectId, { updates: [updatedQnAFile] });
};

export const createQnAFileState = async (
  callbackHelpers: CallbackInterface,
  { id, content, projectId }: { id: string; content: string; projectId: string }
) => {
  const { snapshot } = callbackHelpers;
  const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
  const { languages, defaultLanguage } = await snapshot.getPromise(settingsState(projectId));
  const createdQnaId = `${id}.${defaultLanguage}`;
  const createdQnaFile = (await qnaWorker.parse(id, content)) as QnAFile;
  if (qnaFiles.find((qna) => qna.id === createdQnaId)) {
    throw new Error('qna file already exist');
  }
  const changes: QnAFile[] = [];
  // copy default locale qna file on other locales
  languages.forEach((lang) => {
    const fileId = `${id}.${lang}`;
    qnaFileStatusStorage.updateFileStatus(projectId, fileId);
    changes.push({
      ...createdQnaFile,
      id: fileId,
    });
  });
  updateQnaFiles(callbackHelpers, projectId, { adds: changes });
};

export const createSourceQnAFileByLocaleState = async (
  callbackHelpers: CallbackInterface,
  { id, content, locale, projectId }: { id: string; content: string; locale: string; projectId: string }
) => {
  const { snapshot } = callbackHelpers;
  const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
  const createdQnaId = `${id}.${locale}`;
  const createdQnaFile = (await qnaWorker.parse(id, content)) as QnAFile;
  if (qnaFiles.find((qna) => qna.id === createdQnaId)) {
    throw new Error('qna file already exist');
  }
  updateQnaFiles(callbackHelpers, projectId, { adds: [createdQnaFile] });
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
  const { snapshot } = callbackHelpers;
  const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
  const locale = await snapshot.getPromise(localeState(projectId));

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
  updateQnaFiles(callbackHelpers, projectId, { deletes: [targetQnAFile] });
};

export const createKBFileState = async (
  callbackHelpers: CallbackInterface,
  { id, name, content, projectId }: { id: string; name: string; content: string; projectId: string }
) => {
  const { snapshot } = callbackHelpers;
  const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
  const { defaultLanguage } = await snapshot.getPromise(settingsState(projectId));
  const createdSourceQnAId = `${name}.source.${defaultLanguage}`;

  if (qnaFiles.find((qna) => qna.id === createdSourceQnAId)) {
    throw new Error(`source qna file ${createdSourceQnAId}.qna already exist`);
  }

  // if created on a dialog, need update this dialog's all locale qna ref
  if (id.includes('.source') === false) {
    updateDialogQnARef(callbackHelpers, { id, name, projectId, qnaFiles });
  }

  qnaFileStatusStorage.updateFileStatus(projectId, createdSourceQnAId);

  //need to create other locale qna files
  await createQnAFileState(callbackHelpers, { id: `${name}.source`, content, projectId });
};

export const createKBFileByLocaleState = async (
  callbackHelpers: CallbackInterface,
  {
    id,
    name,
    content,
    locale,
    projectId,
  }: { id: string; name: string; content: string; locale: string; projectId: string }
) => {
  const { snapshot } = callbackHelpers;
  const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
  const createdSourceQnAId = `${name}.source.${locale}`;

  if (qnaFiles.find((qna) => qna.id === createdSourceQnAId)) {
    throw new Error(`source qna file ${createdSourceQnAId}.qna already exist`);
  }

  // if created on a dialog, need update this dialog's all locale qna ref
  if (id.includes('.source') === false) {
    updateDialogQnARef(callbackHelpers, { id, name, projectId, qnaFiles });
  }

  qnaFileStatusStorage.updateFileStatus(projectId, createdSourceQnAId);

  await createSourceQnAFileByLocaleState(callbackHelpers, { id: createdSourceQnAId, content, locale, projectId });
};

const updateDialogQnARef = (
  callbackHelpers: CallbackInterface,
  params: { id: string; name: string; projectId: string; qnaFiles: QnAFile[] }
) => {
  const { id, name, projectId, qnaFiles } = params;

  let updatedQnAFiles: QnAFile[] = [];
  if (!qnaFiles.find((f) => getBaseName(f.id) === id)) {
    throw new Error(`update qna file ${id}.{locale} not exist`);
  }

  updatedQnAFiles = qnaFiles
    .filter((file) => getBaseName(file.id) === id)
    .map((file) => {
      qnaFileStatusStorage.updateFileStatus(projectId, file.id);
      return qnaUtil.addImport(file, `${name}.source.qna`);
    });
  updateQnaFiles(callbackHelpers, projectId, { updates: updatedQnAFiles });
};

export const removeKBFileState = async (
  callbackHelpers: CallbackInterface,
  { id, projectId }: { id: string; projectId: string }
) => {
  const { snapshot } = callbackHelpers;
  const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
  const locale = await snapshot.getPromise(localeState(projectId));

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
  updateQnaFiles(callbackHelpers, projectId, { deletes: [targetQnAFile] });
};

export const renameKBFileState = async (
  callbackHelpers: CallbackInterface,
  { id, name, projectId }: { id: string; name: string; projectId: string }
) => {
  const { set, snapshot } = callbackHelpers;
  const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
  const locale = getKBLocale(id);
  const targetQnAFile = qnaFiles.find((item) => item.id === id);
  if (!targetQnAFile) {
    throw new Error(`rename qna container file ${id} not exist`);
  }

  const newQnAFile = qnaFiles.find((item) => item.id === `${name}.source.${locale}`);
  if (newQnAFile) {
    throw new Error(`rename qna container file to ${name} already exist`);
  }
  qnaFileStatusStorage.removeFileStatus(projectId, targetQnAFile.id);

  updateQnaFiles(callbackHelpers, projectId, {
    deletes: [targetQnAFile],
    adds: [
      {
        ...targetQnAFile,
        id: `${name}.source.${locale}`,
      },
    ],
  });
  set(qnaFileState({ projectId, qnaFileId: id }), (prevQnAFile) => {
    return {
      ...prevQnAFile,
      id: `${name}.source.${locale}`,
    };
  });
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
      id, //qna file id: dialogName.locale or kbName.source.locale
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

  const updateContainerQnAFile = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      content,
      projectId,
    }: {
      id: string;
      content: string;
      projectId: string;
    }) => {
      const updatedQnAFile = (await qnaWorker.parse(id, content)) as QnAFile;

      updateQnaFiles(callbackHelpers, projectId, { updates: [updatedQnAFile] });
    }
  );

  const createQnAFile = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      content,
      projectId,
    }: {
      id: string;
      locale: string;
      content: string;
      projectId: string;
      filteredLocales: string[];
    }) => {
      await createQnAFileState(callbackHelpers, { id, content, projectId });
    }
  );

  const removeQnAFile = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, projectId }: { id: string; projectId: string }) => {
      await removeQnAFileState(callbackHelpers, { id, projectId });
    }
  );

  const removeQnAFileOnAllLocales = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({ id, projectId }: { id: string; projectId: string }) => {
      const { snapshot } = callbackHelpers;
      const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));

      const targetQnAFiles = qnaFiles.filter((item) => getBaseName(item.id) === id);
      if (!targetQnAFiles || targetQnAFiles.length === 0) {
        throw new Error(`remove qna files ${id} not exist`);
      }

      targetQnAFiles.forEach((file) => {
        qnaFileStatusStorage.removeFileStatus(projectId, file.id);
      });
      updateQnaFiles(callbackHelpers, projectId, { deletes: [...targetQnAFiles] });
    }
  );

  const dismissCreateQnAModal = useRecoilCallback(
    ({ set }: CallbackInterface) => async ({ projectId }: { projectId: string }) => {
      set(showCreateQnAFromUrlDialogState(projectId), false);
      set(showCreateQnAFromScratchDialogState(projectId), false);
    }
  );

  const importQnAFromUrl = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      containerId,
      dialogId,
      url,
      multiTurn,
      projectId,
    }: {
      containerId: string; // qna container file id: {name}.source.{locale}
      dialogId: string;
      url: string;
      multiTurn: boolean;
      projectId: string;
    }) => {
      const { snapshot } = callbackHelpers;
      const notification = createNotification(getQnaPendingNotification(url));
      addNotificationInternal(callbackHelpers, notification);

      let response;
      try {
        response = await httpClient.get(`/utilities/qna/parse`, {
          params: { url: encodeURIComponent(url), multiTurn },
        });
        const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
        const notification = createNotification(
          getQnaSuccessNotification(() => {
            navigateTo(
              rootBotProjectId === projectId
                ? `/bot/${projectId}/knowledge-base/${dialogId}`
                : `/bot/${rootBotProjectId}/skill/${projectId}/knowledge-base/${dialogId}`
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
        return;
      } finally {
        deleteNotificationInternal(callbackHelpers, notification.id);
      }

      const contentForSourceQnA = `> !# @source.url=${url}
> !# @source.multiTurn=${multiTurn}
${response.data}
`;
      await updateContainerQnAFile({ id: containerId, content: contentForSourceQnA, projectId });
    }
  );

  const createQnAKBFromUrl = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      name,
      url,
      locale,
      multiTurn,
      projectId,
    }: {
      id: string; // dialogId.locale
      name: string;
      url: string;
      locale: string;
      multiTurn: boolean;
      projectId: string;
    }) => {
      const { snapshot } = callbackHelpers;
      await dismissCreateQnAModal({ projectId });
      const notification = createNotification(getQnaPendingNotification(url));
      addNotificationInternal(callbackHelpers, notification);

      let response;
      try {
        response = await httpClient.get(`/utilities/qna/parse`, {
          params: { url: encodeURIComponent(url), multiTurn },
        });
        const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
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

      await createKBFileByLocaleState(callbackHelpers, {
        id,
        name,
        content: contentForSourceQnA,
        locale,
        projectId,
      });

      await createQnAFromUrlDialogSuccess({ projectId });
    }
  );

  const createQnAKBsFromUrls = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      name,
      urls,
      locales,
      multiTurn,
      projectId,
    }: {
      id: string; // dialogId.locale
      name: string;
      urls: string[];
      locales: string[];
      multiTurn: boolean;
      projectId: string;
    }) => {
      const { snapshot } = callbackHelpers;
      await dismissCreateQnAModal({ projectId });
      const pairs: { locale: string; content: string }[] = locales.map((locale) => {
        return { locale, content: '' };
      });
      await Promise.all(
        urls.map(async (url, index) => {
          const notification = createNotification(getQnaPendingNotification(url));
          addNotificationInternal(callbackHelpers, notification);

          let response;
          try {
            response = await httpClient.get(`/utilities/qna/parse`, {
              params: { url: encodeURIComponent(url), multiTurn },
            });
            const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
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
          pairs[index].content = contentForSourceQnA;
        })
      );

      const { languages } = await snapshot.getPromise(settingsState(projectId));

      const toBeCopiedLocales = languages.filter((l) => {
        return !locales.includes(l);
      });
      toBeCopiedLocales.forEach((locale) => {
        pairs.push({ locale, content: pairs[0].content });
      });

      await createKBFileOnLocalesState(callbackHelpers, {
        id,
        name,
        data: pairs,
        projectId,
      });
      await createQnAFromUrlDialogSuccess({ projectId });
    }
  );

  const createKBFileOnLocalesState = async (
    callbackHelpers: CallbackInterface,
    {
      id,
      name,
      data,
      projectId,
    }: { id: string; name: string; data: { content: string; locale: string }[]; projectId: string }
  ) => {
    const { snapshot } = callbackHelpers;
    const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
    const changes: QnAFile[] = [];
    // if created on a dialog, need update this dialog's all locale qna ref
    if (id.includes('.source') === false) {
      updateDialogQnARef(callbackHelpers, { id, name, projectId, qnaFiles });
    }
    await Promise.all(
      data.map(async (d) => {
        const createdSourceQnAId = `${name}.source.${d.locale}`;

        if (qnaFiles.find((qna) => qna.id === createdSourceQnAId)) {
          throw new Error(`source qna file ${createdSourceQnAId}.qna already exist`);
        }
        const createdQnaFile = (await qnaWorker.parse(createdSourceQnAId, d.content)) as QnAFile;
        changes.push(createdQnaFile);
      })
    );
    updateQnaFiles(callbackHelpers, projectId, { adds: changes });
  };

  const createQnAKBFromScratch = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      name,
      projectId,
      content = '',
    }: {
      id: string;
      name: string;
      content?: string;
      projectId: string;
    }) => {
      await dismissCreateQnAModal({ projectId });

      await createKBFileState(callbackHelpers, { id, name, content, projectId });
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
    (callbackHelpers: CallbackInterface) => async ({
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
      const { snapshot } = callbackHelpers;
      const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.updateQnAQuestion(qnaFile, sectionId, questionId, content);
      updateQnaFiles(callbackHelpers, projectId, { updates: [updatedFile] });
    }
  );

  const updateQnAAnswer = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
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
      const { snapshot } = callbackHelpers;
      const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.updateQnAAnswer(qnaFile, sectionId, content);
      updateQnaFiles(callbackHelpers, projectId, { updates: [updatedFile] });
    }
  );

  const createQnAQuestion = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
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
      const { snapshot } = callbackHelpers;
      const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.createQnAQuestion(qnaFile, sectionId, content);
      updateQnaFiles(callbackHelpers, projectId, { updates: [updatedFile] });
    }
  );

  const removeQnAQuestion = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
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
      const { snapshot } = callbackHelpers;
      const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.removeQnAQuestion(qnaFile, sectionId, questionId);
      updateQnaFiles(callbackHelpers, projectId, { updates: [updatedFile] });
    }
  );

  const createQnAPairs = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      content,
      projectId,
    }: {
      id: string;
      content: string;
      projectId: string;
    }) => {
      const { snapshot } = callbackHelpers;
      const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      // insert into head, need investigate
      const updatedFile = qnaUtil.insertSection(qnaFile, 0, content);
      updateQnaFiles(callbackHelpers, projectId, { updates: [updatedFile] });
    }
  );

  const removeQnAPairs = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      sectionId,
      projectId,
    }: {
      id: string;
      sectionId: string;
      projectId: string;
    }) => {
      const { snapshot } = callbackHelpers;
      const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.removeSection(qnaFile, sectionId);
      updateQnaFiles(callbackHelpers, projectId, { updates: [updatedFile] });
    }
  );

  const createQnAImport = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      sourceId,
      projectId,
    }: {
      id: string;
      sourceId: string;
      projectId: string;
    }) => {
      const { snapshot } = callbackHelpers;
      const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.addImport(qnaFile, `${sourceId}.qna`);
      updateQnaFiles(callbackHelpers, projectId, { updates: [updatedFile] });
    }
  );
  const removeQnAImport = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id,
      sourceId,
      projectId,
    }: {
      id: string;
      sourceId: string;
      projectId: string;
    }) => {
      const { snapshot } = callbackHelpers;
      const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      const updatedFile = qnaUtil.removeImport(qnaFile, `${sourceId}.qna`);
      updateQnaFiles(callbackHelpers, projectId, { updates: [updatedFile] });
    }
  );

  const removeQnAImportOnAllLocales = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
      id, //dialogName
      sourceId,
      projectId,
    }: {
      id: string;
      sourceId: string;
      projectId: string;
    }) => {
      const { snapshot } = callbackHelpers;
      const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
      const targetQnaFiles = qnaFiles.filter((f) => getBaseName(f.id) === id);
      if (!targetQnaFiles || targetQnaFiles.length === 0) return targetQnaFiles;

      const updatedFiles = targetQnaFiles.map((f) => {
        return qnaUtil.removeImport(f, `${sourceId}.qna`);
      });
      updateQnaFiles(callbackHelpers, projectId, { updates: [...updatedFiles] });
    }
  );

  const updateQnAImport = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async ({
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
      const { snapshot } = callbackHelpers;
      const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
      const qnaFile = qnaFiles.find((temp) => temp.id === id);
      if (!qnaFile) return qnaFiles;

      let updatedFile = qnaUtil.removeImport(qnaFile, `${sourceId}.qna`);
      updatedFile = qnaUtil.addImport(updatedFile, `${newSourceId}.qna`);
      updateQnaFiles(callbackHelpers, projectId, { updates: [updatedFile] });
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
    removeQnAImportOnAllLocales,
    updateQnAImport,
    createQnAPairs,
    removeQnAPairs,
    createQnAQuestion,
    removeQnAQuestion,
    updateQnAQuestion,
    updateQnAAnswer,
    createQnAFile,
    removeQnAFile,
    removeQnAFileOnAllLocales,
    updateQnAFile,
    removeQnAKB,
    renameQnAKB,
    createQnAKBFromUrl,
    createQnAKBsFromUrls,
    createQnAKBFromScratch,
    createQnAFromScratchDialogBegin,
    createQnAFromScratchDialogBack,
    createQnAFromScratchDialogCancel,
    createQnAFromUrlDialogBegin,
    createQnAFromUrlDialogCancel,
    importQnAFromUrl,
  };
};
