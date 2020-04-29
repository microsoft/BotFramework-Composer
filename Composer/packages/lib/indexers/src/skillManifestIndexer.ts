// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo, SkillManifestInfo } from '@bfc/shared';

import { getBaseName } from './utils/help';

const index = (skillManifestFiles: FileInfo[]) => {
  return skillManifestFiles.reduce((manifests: SkillManifestInfo[], { content, name, lastModified }) => {
    try {
      const jsonContent = JSON.parse(content);
      return [...manifests, { content: jsonContent, id: getBaseName(name, '.manifest'), lastModified }];
    } catch (error) {
      return manifests;
    }
  }, [] as SkillManifestInfo[]);
};

export const skillManifestIndexer = {
  index,
};
