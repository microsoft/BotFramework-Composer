// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo, importResolverGenerator } from '@bfc/shared';

import { dialogIndexer } from './dialogIndexer';
import { dialogSchemaIndexer } from './dialogSchemaIndexer';
import { lgIndexer } from './lgIndexer';
import { luIndexer } from './luIndexer';
import { skillManifestIndexer } from './skillManifestIndexer';
import { FileExtensions } from './utils/fileExtensions';
import { getExtension, getBaseName } from './utils/help';

class Indexer {
  private classifyFile(files: FileInfo[]) {
    return files.reduce(
      (result, file) => {
        const extension = getExtension(file.name);
        if (extension && result[extension]) {
          result[extension].push(file);
        }
        return result;
      },
      {
        [FileExtensions.lg]: [],
        [FileExtensions.Lu]: [],
        [FileExtensions.Dialog]: [],
        [FileExtensions.DialogSchema]: [],
        [FileExtensions.Manifest]: [],
      }
    );
  }

  private getLgImportResolver = (files: FileInfo[], locale: string) => {
    const lgFiles = files.map(({ name, content }) => {
      return {
        id: getBaseName(name, '.lg'),
        content,
      };
    });

    return importResolverGenerator(lgFiles, '.lg', locale);
  };

  public index(files: FileInfo[], botName: string, locale: string) {
    const result = this.classifyFile(files);
    return {
      dialogs: dialogIndexer.index(result[FileExtensions.Dialog], botName),
      dialogSchemas: dialogSchemaIndexer.index(result[FileExtensions.DialogSchema]),
      lgFiles: lgIndexer.index(result[FileExtensions.lg], this.getLgImportResolver(result[FileExtensions.lg], locale)),
      luFiles: luIndexer.index(result[FileExtensions.Lu]),
      skillManifestFiles: skillManifestIndexer.index(result[FileExtensions.Manifest]),
    };
  }
}

export const indexer = new Indexer();

export * from './botIndexer';
export * from './dialogIndexer';
export * from './dialogSchemaIndexer';
export * from './lgIndexer';
export * from './luIndexer';
export * from './utils';
export * from './validations';
