// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@bfc/shared';

const index = (files: FileInfo[]) => {
  if (!files.length) return {};

  const { content } = files[0];
  try {
    return JSON.parse(content);
  } catch (error) {
    return {};
  }
};

export const crossTrainConfigIndexer = {
  index,
};
