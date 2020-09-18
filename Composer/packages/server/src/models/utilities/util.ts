// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const getDialogNameFromFile = (file: string) => {
  const tokens = file.split('.');
  const length = tokens.length;
  let dialogName = '';
  if (length > 1) {
    const extension = tokens[length - 1];
    switch (extension) {
      case 'dialog':
      case 'lu':
      case 'lg':
      case 'qna':
        dialogName = tokens[0];
        break;
    }
  }
  return dialogName;
};
