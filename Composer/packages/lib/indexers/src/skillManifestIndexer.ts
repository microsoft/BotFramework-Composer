// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo } from '@bfc/shared';

import { getBaseName } from './utils/help';

const index = (skillManifestFiles: FileInfo[]) => {
  return skillManifestFiles.reduce((manifests: any[], { content, name, lastModified }) => {
    try {
      const jsonContent = JSON.parse(content);
      return [...manifests, { content: jsonContent, id: getBaseName(name, '.manifest'), lastModified }];
    } catch (error) {
      return manifests;
    }
  }, [] as any[]);
};

export const skillManifestIndexer = {
  index,
};
