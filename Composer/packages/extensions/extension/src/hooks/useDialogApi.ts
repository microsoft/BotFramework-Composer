// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useShellApi } from './useShellApi';

export const useDialogApi = () => {
  const {
    shellApi: { getDialog, saveDialog, createDialog },
  } = useShellApi();

  async function createDialogCompleted(): Promise<string | null> {
    const newDialogId = await createDialog([]);
    // TODO: @lei9444 be able to new dialog data here.
    return newDialogId;
  }

  return {
    createDialog: createDialogCompleted,
    readDialog: getDialog,
    updateDialog: saveDialog,
  };
};
