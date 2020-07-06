// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { LuFile, importResolverGenerator } from '@bfc/shared';
import { dialogIndexer, autofixReferInDialog, luIndexer, lgIndexer, validateDialog } from '@bfc/indexers';

import luFileStatusStorage from '../../utils/luFileStatusStorage';
import { getBaseName } from '../../utils';
import {
  dialogsState,
  lgFilesState,
  luFilesState,
  projectIdState,
  schemasState,
  onCreateDialogCompleteState,
  actionsSeedState,
  showCreateDialogModalState,
  localeState,
} from '../atoms/botState';

const createLgFile = async (callbackHelpers: CallbackInterface, id: string, content: string) => {
  const { set, snapshot } = callbackHelpers;
  const lgFiles = await snapshot.getPromise(lgFilesState);
  const locale = await snapshot.getPromise(localeState);

  id = `${id}.${locale}`;

  // slot with common.lg import
  let lgInitialContent = '';
  const lgCommonFile = lgFiles.find(({ id }) => id === `common.${locale}`);
  if (lgCommonFile) {
    lgInitialContent = `[import](common.lg)`;
  }
  content = [lgInitialContent, content].join('\n');

  const { parse } = lgIndexer;
  const lgImportresolver = importResolverGenerator(lgFiles, '.lg');
  const lgFile = { id, content, ...parse(content, id, lgImportresolver) };
  set(lgFilesState, [...lgFiles, lgFile]);
};

const removeLgFile = async (callbackHelpers: CallbackInterface, id: string) => {
  const { set, snapshot } = callbackHelpers;
  let lgFiles = await snapshot.getPromise(lgFilesState);
  lgFiles = lgFiles.filter((file) => getBaseName(file.id) !== id && file.id !== id);
  set(lgFilesState, lgFiles);
};

const createLuFile = async (callbackHelpers: CallbackInterface, id: string, content: string) => {
  const { set, snapshot } = callbackHelpers;
  const luFiles = await snapshot.getPromise(luFilesState);
  const locale = await snapshot.getPromise(localeState);
  const projectId = await snapshot.getPromise(projectIdState);

  id = `${id}.${locale}`;
  const { parse } = luIndexer;
  const luFile = { id, content, ...parse(content, id) };
  luFileStatusStorage.updateFileStatus(projectId, id);
  set(luFilesState, [...luFiles, luFile]);
};

const removeLuFile = async (callbackHelpers: CallbackInterface, id: string) => {
  const { set, snapshot } = callbackHelpers;
  let luFiles = await snapshot.getPromise(luFilesState);
  const projectId = await snapshot.getPromise(projectIdState);
  luFiles = luFiles.reduce((result: LuFile[], file) => {
    if (getBaseName(file.id) === id || file.id === id) {
      luFileStatusStorage.removeFileStatus(projectId, id);
    } else {
      result.push(file);
    }
    return result;
  }, []);
  set(luFilesState, luFiles);
};

export const dialogsDispatcher = {
  removeDialog: (callbackHelpers: CallbackInterface) => async (id: string) => {
    const { set, snapshot } = callbackHelpers;
    let dialogs = await snapshot.getPromise(dialogsState);
    dialogs = dialogs.filter((dialog) => dialog.id !== id);
    set(dialogsState, dialogs);
    //remove dialog should remove all locales lu and lg files
    await removeLgFile(callbackHelpers, id);
    await removeLuFile(callbackHelpers, id);
  },

  updateDialog: (callbackHelpers: CallbackInterface) => async ({ id, content }) => {
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
  },

  createDialogBegin: (callbackHelpers: CallbackInterface) => (actions, onComplete) => {
    const { set } = callbackHelpers;
    set(actionsSeedState, actions);
    set(onCreateDialogCompleteState, onComplete);
    set(showCreateDialogModalState, true);
  },

  createDialogCancel: (callbackHelpers: CallbackInterface) => () => {
    const { set } = callbackHelpers;
    set(actionsSeedState, []);
    set(onCreateDialogCompleteState, undefined);
    set(showCreateDialogModalState, false);
  },

  createDialog: (callbackHelpers: CallbackInterface) => async ({ id, content }) => {
    const { set, snapshot } = callbackHelpers;
    const fixedContent = autofixReferInDialog(id, content);
    const schemas = await snapshot.getPromise(schemasState);
    const lgFiles = await snapshot.getPromise(lgFilesState);
    const luFiles = await snapshot.getPromise(luFilesState);
    const dialog = { isRoot: false, displayName: id, ...dialogIndexer.parse(id, fixedContent) };
    dialog.diagnostics = validateDialog(dialog, schemas.sdk.content, lgFiles, luFiles);
    await createLgFile(callbackHelpers, id, '');
    await createLuFile(callbackHelpers, id, '');

    set(dialogsState, (dialogs) => [...dialogs, dialog]);
    set(actionsSeedState, []);
    set(showCreateDialogModalState, false);
    set(onCreateDialogCompleteState, undefined);
  },
};
