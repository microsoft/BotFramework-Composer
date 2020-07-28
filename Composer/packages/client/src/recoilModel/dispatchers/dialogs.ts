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
  isRecognizerDropdownOpen,
} from '../atoms/botState';

import { createLgFileState, removeLgFileState } from './lg';
import { createLuFileState, removeLuFileState } from './lu';
import { createQnAFileState, removeQnAFileState } from './qna';

export const dialogsDispatcher = () => {
  const removeDialog = useRecoilCallback((callbackHelpers: CallbackInterface) => async (id: string) => {
    const { set, snapshot } = callbackHelpers;
    let dialogs = await snapshot.getPromise(dialogsState);
    dialogs = dialogs.filter((dialog) => dialog.id !== id);
    set(dialogsState, dialogs);
    //remove dialog should remove all locales lu and lg files
    await removeLgFileState(callbackHelpers, { id });
    await removeLuFileState(callbackHelpers, { id });
    await removeQnAFileState(callbackHelpers, { id });
  });

  const updateDialog = useRecoilCallback((callbackHelpers: CallbackInterface) => async ({ id, content }) => {
    const { set, snapshot } = callbackHelpers;
    let dialogs = await snapshot.getPromise(dialogsState);
    const schemas = await snapshot.getPromise(schemasState);
    const lgFiles = await snapshot.getPromise(lgFilesState);
    const luFiles = await snapshot.getPromise(luFilesState);
    // migration: add id for dialog
    if (!content.id) {
      content.id = id;
    }
    dialogs = dialogs.map((dialog) => {
      if (dialog.id === id) {
        dialog = {
          ...dialog,
          ...dialogIndexer.parse(dialog.id, content),
        };
        dialog.diagnostics = validateDialog(dialog, schemas.sdk.content, lgFiles, luFiles);
        return dialog;
      }
      return dialog;
    });
    set(dialogsState, dialogs);
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
    const fixedContent = autofixReferInDialog(id, content);
    const schemas = await snapshot.getPromise(schemasState);
    const lgFiles = await snapshot.getPromise(lgFilesState);
    const luFiles = await snapshot.getPromise(luFilesState);
    const dialog = { isRoot: false, displayName: id, ...dialogIndexer.parse(id, fixedContent) };
    dialog.diagnostics = validateDialog(dialog, schemas.sdk.content, lgFiles, luFiles);
    dialog.content.id = id;
    await createLgFileState(callbackHelpers, { id, content: '' });
    await createLuFileState(callbackHelpers, { id, content: '' });
    await createQnAFileState(callbackHelpers, { id, content: '' });

    set(dialogsState, (dialogs) => [...dialogs, dialog]);
    set(actionsSeedState, []);
    set(showCreateDialogModalState, false);
    const onComplete = (await snapshot.getPromise(onCreateDialogCompleteState)).func;
    if (typeof onComplete === 'function') {
      setTimeout(() => onComplete(id));
    }
    set(onCreateDialogCompleteState, { func: undefined });
  });

  const openRecognizerDropdown = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    const { set } = callbackHelpers;
    set(isRecognizerDropdownOpen, true);
  });

  const closeRecognizerDropdown = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    const { set } = callbackHelpers;
    set(isRecognizerDropdownOpen, false);
  });

  return {
    removeDialog,
    createDialog,
    createDialogCancel,
    createDialogBegin,
    updateDialog,
    openRecognizerDropdown,
    closeRecognizerDropdown,
  };
};
