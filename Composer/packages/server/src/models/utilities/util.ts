// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export const getDialogFileName = (file: string) => {
  if (file.endsWith('.dialog')) {
    const lastDotIndex = file.lastIndexOf('.');
    return file.substring(0, lastDotIndex);
  }
};

export const getQnAFileName = (file: string) => {
  if (file.endsWith('.qna')) {
    const firstDotIndex = file.indexOf('.');
    return file.substring(0, firstDotIndex);
  }
};
