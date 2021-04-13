// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { dialogIndexer, autofixReferInDialog } from '@bfc/indexers';
import { DialogInfo, checkForPVASchema } from '@bfc/shared';

import {
  dialogIdsState,
  schemasState,
  onCreateDialogCompleteState,
  actionsSeedState,
  showCreateDialogModalState,
  dialogState,
  dispatcherState,
} from '../atoms';

import { createLgFileState, removeLgFileState } from './lg';
import { createLuFileState, removeLuFileState } from './lu';
import { createQnAFileState, removeQnAFileState } from './qna';
import { removeDialogSchema } from './dialogSchema';

export const dialogsDispatcher = () => {
  const removeDialog = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (id: string, projectId: string) => {
      const { set, reset, snapshot } = callbackHelpers;

      const dialog = await snapshot.getPromise(dialogState({ projectId, dialogId: id }));

      // If the dialog is a generated form dialog, delete using form dialog dispatcher
      if (dialog.content?.$schema) {
        const { removeFormDialog } = await snapshot.getPromise(dispatcherState);
        await removeFormDialog({ projectId, dialogId: id });
        return;
      }

      reset(dialogState({ projectId, dialogId: id }));
      set(dialogIdsState(projectId), (previousDialogIds) => previousDialogIds.filter((dialogId) => dialogId !== id));

      //remove dialog should remove all locales lu, lg and qna files and the dialog schema file
      await removeLgFileState(callbackHelpers, { id, projectId });
      await removeLuFileState(callbackHelpers, { id, projectId });
      await removeQnAFileState(callbackHelpers, { id, projectId });
      removeDialogSchema(callbackHelpers, { id, projectId });
    }
  );

  const updateDialog = useRecoilCallback(
    ({ snapshot, set }: CallbackInterface) => async ({ id, content, projectId }) => {
      // migration: add id for dialog
      if (typeof content === 'object' && !content.id) {
        content.id = id;
      }

      const fixedContent = JSON.parse(autofixReferInDialog(id, JSON.stringify(content)));

      const dialog = await snapshot.getPromise(dialogState({ projectId, dialogId: id }));
      const newDialog: DialogInfo = { ...dialog, ...dialogIndexer.parse(dialog.id, fixedContent) };
      set(dialogState({ projectId, dialogId: id }), newDialog);
    }
  );

  const createDialogBegin = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => (actions, onComplete, projectId: string) => {
      const { set } = callbackHelpers;
      set(actionsSeedState(projectId), actions);
      set(onCreateDialogCompleteState(projectId), { func: onComplete });
      set(showCreateDialogModalState, true);
    }
  );

  const createDialogCancel = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    const { set, snapshot } = callbackHelpers;
    const { func: onComplete } = await snapshot.getPromise(onCreateDialogCompleteState(projectId));

    onComplete?.(null);

    set(actionsSeedState(projectId), []);
    set(onCreateDialogCompleteState(projectId), { func: undefined });
    set(showCreateDialogModalState, false);
  });

  const createDialog = useRecoilCallback((callbackHelpers: CallbackInterface) => async ({ id, content, projectId }) => {
    const { set, snapshot } = callbackHelpers;
    const fixedContent = JSON.parse(autofixReferInDialog(id, JSON.stringify(content)));
    const schemas = await snapshot.getPromise(schemasState(projectId));
    const dialog = { isRoot: false, ...dialogIndexer.parse(id, fixedContent) };

    if (typeof dialog.content === 'object') {
      dialog.content.id = id;
    }
    await createLgFileState(callbackHelpers, { id, content: '', projectId });
    await createLuFileState(callbackHelpers, { id, content: '', projectId });

    if (!checkForPVASchema(schemas.sdk)) {
      await createQnAFileState(callbackHelpers, { id, content: '', projectId });
    }

    set(dialogState({ projectId, dialogId: dialog.id }), dialog);
    set(dialogIdsState(projectId), (dialogsIds) => [...dialogsIds, dialog.id]);
    set(actionsSeedState(projectId), []);
    set(showCreateDialogModalState, false);
    const onComplete = (await snapshot.getPromise(onCreateDialogCompleteState(projectId))).func;
    if (typeof onComplete === 'function') {
      setTimeout(() => onComplete(id));
    }
    set(onCreateDialogCompleteState(projectId), { func: undefined });
  });

  return {
    removeDialog,
    createDialog,
    createDialogCancel,
    createDialogBegin,
    updateDialog,
  };
};
