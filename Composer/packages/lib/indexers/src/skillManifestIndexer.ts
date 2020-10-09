// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo, SkillManifestFile } from '@bfc/shared';

import { getBaseName } from './utils/help';

const index = (skillManifestFiles: FileInfo[]) => {
  return skillManifestFiles.reduce((manifests: SkillManifestFile[], { content, name, lastModified }) => {
    try {
      const jsonContent = JSON.parse(content);
      return [...manifests, { content: jsonContent, id: getBaseName(name, '.json'), lastModified }];
    } catch (error) {
      return manifests;
    }
  }, [] as SkillManifestFile[]);
};

export const skillManifestIndexer = {
  index,
};
