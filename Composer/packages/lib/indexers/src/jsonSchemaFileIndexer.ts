// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FileInfo, JsonSchemaFile } from '@bfc/shared';
import has from 'lodash/has';

import { getBaseName } from './utils/help';

const index = (jsonFiles: FileInfo[]) => {
  return jsonFiles.reduce((jsonSchemaFiles: JsonSchemaFile[], { content, name }) => {
    try {
      const jsonContent = JSON.parse(content);

      if (has(jsonContent, '$schema')) {
        const schema = jsonContent.$schema.toLowerCase().trim();
        // prettier-ignore
        if (schema.startsWith('http://json-schema.org')) { // lgtm [js/incomplete-url-substring-sanitization]
          return [...jsonSchemaFiles, { content: jsonContent, id: getBaseName(name) }];
        }
      }

      return jsonSchemaFiles;
    } catch (error) {
      return jsonSchemaFiles;
    }
  }, [] as JsonSchemaFile[]);
};

export const jsonSchemaFileIndexer = {
  index,
};
