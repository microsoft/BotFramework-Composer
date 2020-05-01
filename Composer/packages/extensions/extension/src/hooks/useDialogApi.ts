// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useShellApi } from './useShellApi';

export const useDialogApi = () => {
  const {
    shellApi: { getDialog, saveDialog, createDialog },
  } = useShellApi();

  return {
    createDialog: () => createDialog([]),
    readDialog: getDialog,
    updateDialog: saveDialog,
  };
};
