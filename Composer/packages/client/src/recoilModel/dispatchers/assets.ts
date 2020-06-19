/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { LuFile } from '@bfc/shared';
import { dialogIndexer } from '@bfc/indexers';

import luFileStatusStorage from '../../utils/luFileStatusStorage';
import { getBaseName } from '../../utils';
import { dialogsState, lgFilesState, luFilesState, projectIdState, schemasState } from '../atoms/botState';

export const assetsDispatcher = () => {
  const removeLgFile = async (callbackHelpers: CallbackInterface, id: string) => {
    const { set, snapshot } = callbackHelpers;
    let lgFiles = await snapshot.getPromise(lgFilesState);
    lgFiles = lgFiles.filter((file) => getBaseName(file.id) !== id && file.id !== id);
    set(lgFilesState, lgFiles);
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

  const removeDialog = useRecoilCallback<[string], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async (id: string) => {
      const { set, snapshot } = callbackHelpers;
      let dialogs = await snapshot.getPromise(dialogsState);
      dialogs = dialogs.filter((dialog) => dialog.id !== id);
      set(dialogsState, dialogs);
      //remove dialog should remove all locales lu and lg files
      await removeLgFile(callbackHelpers, id);
      await removeLuFile(callbackHelpers, id);
    }
  );

  const updateDialog = useRecoilCallback<[string, any], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async (id: string, content: any) => {
      const { set, snapshot } = callbackHelpers;
      let dialogs = await snapshot.getPromise(dialogsState);
      const schemas = await snapshot.getPromise(schemasState);
      dialogs = dialogs.map((dialog) =>
        dialog.id === id ? { ...dialog, ...dialogIndexer.parse(id, content, schemas.sdk.content) } : dialog
      );
      set(dialogsState, dialogs);
    }
  );

  // const createDialog = useRecoilCallback<>((callbackHelpers: CallbackInterface) => async (id: string, content: any) => {
  //   const { set, snapshot } = callbackHelpers;
  //   let dialogs = await snapshot.getPromise(dialogsState);
  //   const schemas = await snapshot.getPromise(schemasState);
  //   dialogs = dialogs.map((dialog) =>
  //     dialog.id === id ? { ...dialog, ...dialogIndexer.parse(id, content, schemas.sdk.content) } : dialog
  //   );
  //   set(dialogsState, dialogs);
  // });
  return {
    removeDialog,
    //createDialog,
    updateDialog,
  };
};
