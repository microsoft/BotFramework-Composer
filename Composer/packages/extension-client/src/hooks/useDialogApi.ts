// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ShellApi } from '@botframework-composer/types';

export const useDialogApi = (shellApi: ShellApi) => {
  const { getDialog, saveDialog, createDialog } = shellApi;

  return {
    createDialog: () => createDialog([]),
    readDialog: getDialog,
    updateDialog: saveDialog,
  };
};
