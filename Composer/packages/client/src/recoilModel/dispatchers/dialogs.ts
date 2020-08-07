// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { dialogIndexer, autofixReferInDialog, validateDialog } from '@bfc/indexers';

import {
  dialogsState,
  lgFilesState,
  luFilesState,
  schemasState,
  onCreateDialogCompleteState,
  actionsSeedState,
  showCreateDialogModalState,
} from '../atoms/botState';

import { createLgFileState, removeLgFileState } from './lg';
import { createLuFileState, removeLuFileState } from './lu';
import { removeDialogSchema } from './dialogSchema';

export const dialogsDispatcher = () => {
  const removeDialog = useRecoilCallback((callbackHelpers: CallbackInterface) => async (id: string) => {
    const { set, snapshot } = callbackHelpers;
    let dialogs = await snapshot.getPromise(dialogsState);
    dialogs = dialogs.filter((dialog) => dialog.id !== id);
    set(dialogsState, dialogs);
    //remove dialog should remove all locales lu and lg files and the dialog schema file
    await removeLgFileState(callbackHelpers, { id });
    await removeLuFileState(callbackHelpers, { id });
    await removeDialogSchema(callbackHelpers, id);
  });

  const updateDialog = useRecoilCallback(({ set }: CallbackInterface) => ({ id, content }) => {
    set(dialogsState, (dialogs) => {
      return dialogs.map((dialog) => {
        if (dialog.id === id) {
          const fixedContent = JSON.parse(autofixReferInDialog(id, JSON.stringify(content)));
          return { ...dialog, ...dialogIndexer.parse(dialog.id, fixedContent) };
        }
        return dialog;
      });
    });
  });

  const createDialogBegin = useRecoilCallback((callbackHelpers: CallbackInterface) => (actions, onComplete) => {
    const { set } = callbackHelpers;
    set(actionsSeedState, actions);
    set(onCreateDialogCompleteState, { func: onComplete });
    set(showCreateDialogModalState, true);
  });

  const createDialogCancel = useRecoilCallback((callbackHelpers: CallbackInterface) => () => {
    const { set } = callbackHelpers;
    set(actionsSeedState, []);
    set(onCreateDialogCompleteState, { func: undefined });
    set(showCreateDialogModalState, false);
  });

  const createDialog = useRecoilCallback((callbackHelpers: CallbackInterface) => async ({ id, content }) => {
    const { set, snapshot } = callbackHelpers;
    const fixedContent = JSON.parse(autofixReferInDialog(id, JSON.stringify(content)));
    const schemas = await snapshot.getPromise(schemasState);
    const lgFiles = await snapshot.getPromise(lgFilesState);
    const luFiles = await snapshot.getPromise(luFilesState);
    const dialog = { isRoot: false, displayName: id, ...dialogIndexer.parse(id, fixedContent) };
    dialog.diagnostics = validateDialog(dialog, schemas.sdk.content, lgFiles, luFiles);
    await createLgFileState(callbackHelpers, { id, content: '' });
    await createLuFileState(callbackHelpers, { id, content: '' });

    set(dialogsState, (dialogs) => [...dialogs, dialog]);
    set(actionsSeedState, []);
    set(showCreateDialogModalState, false);
    const onComplete = (await snapshot.getPromise(onCreateDialogCompleteState)).func;
    if (typeof onComplete === 'function') {
      setTimeout(() => onComplete(id));
    }
    set(onCreateDialogCompleteState, { func: undefined });
  });
  return {
    removeDialog,
    createDialog,
    createDialogCancel,
    createDialogBegin,
    updateDialog,
  };
};
