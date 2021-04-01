// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import axios from 'axios';

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

export const getRemoteFile = async (url): Promise<string> => {
  const response = await axios.get(url);
  return response.data;
};
