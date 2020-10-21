// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo, SkillManifestFile } from '@bfc/shared';
import has from 'lodash/has';

import { getBaseName } from './utils/help';

const index = (skillManifestFiles: FileInfo[]) => {
  return skillManifestFiles.reduce((manifests: SkillManifestFile[], { content, name, lastModified }) => {
    try {
      const jsonContent = JSON.parse(content);

      if (has(jsonContent, '$schema')) {
        const schema = jsonContent.$schema.toLowerCase().trim();
        if (schema.startsWith('https://schemas.botframework.com/schemas/skills')) {
          return [...manifests, { content: jsonContent, id: getBaseName(name, '.json'), lastModified }];
        }
      }

      return manifests;
    } catch (error) {
      return manifests;
    }
  }, [] as SkillManifestFile[]);
};

export const skillManifestIndexer = {
  index,
};
