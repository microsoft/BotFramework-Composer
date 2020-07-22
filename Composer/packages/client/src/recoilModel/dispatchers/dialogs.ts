// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { dialogIndexer, autofixReferInDialog, validateDialog } from '@bfc/indexers';

import {
  dialogsState,
  dialogSchemasState,
  lgFilesState,
  luFilesState,
  schemasState,
  onCreateDialogCompleteState,
  actionsSeedState,
  showCreateDialogModalState,
} from '../atoms/botState';

import { createLgFileState, removeLgFileState } from './lg';
import { createLuFileState, removeLuFileState } from './lu';

export const dialogsDispatcher = () => {
  const createDialogSchema = ({ set }: CallbackInterface, id: string, content: any) => {
    set(dialogSchemasState, (dialogSchemas) => [...dialogSchemas, { id, content }]);
  };

  const updateDialogSchema = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (id: string, content: any) => {
      const { set, snapshot } = callbackHelpers;
      const dialogSchemas = await snapshot.getPromise(dialogSchemasState);

      if (!dialogSchemas.some((dialog) => dialog.id === id)) {
        return createDialogSchema(callbackHelpers, id, content);
      }

      set(dialogSchemasState, (dialogSchemas) =>
        dialogSchemas.map((dialogSchema) => (dialogSchema.id === id ? { ...dialogSchema, content } : dialogSchema))
      );
    }
  );

  const removeDialogSchema = ({ set }: CallbackInterface, id: string) => {
    set(dialogSchemasState, (dialogSchemas) => dialogSchemas.filter((dialogSchema) => dialogSchema.id !== id));
  };

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

  const updateDialog = useRecoilCallback((callbackHelpers: CallbackInterface) => async ({ id, content }) => {
    const { set, snapshot } = callbackHelpers;
    let dialogs = await snapshot.getPromise(dialogsState);
    const schemas = await snapshot.getPromise(schemasState);
    const lgFiles = await snapshot.getPromise(lgFilesState);
    const luFiles = await snapshot.getPromise(luFilesState);
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
    updateDialogSchema,
  };
};
