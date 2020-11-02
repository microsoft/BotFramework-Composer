// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo, RecognizerFile } from '@bfc/shared';

const index = (recognizerFiles: FileInfo[]) => {
  return recognizerFiles.reduce((recognizers: RecognizerFile[], { content, name, lastModified }) => {
    try {
      const jsonContent = JSON.parse(content);
      recognizers.push({ content: jsonContent, id: name });
      return recognizers;
    } catch (error) {
      return recognizers;
    }
  }, [] as RecognizerFile[]);
};

export const recognizerIndexer = {
  index,
};
