// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo } from '@bfc/shared';

import { dialogIndexer } from './dialogIndexer';
import { lgIndexer } from './lgIndexer';
import { luIndexer } from './luIndexer';
import { FileExtensions } from './utils/fileExtensions';
import { getExtension, getBaseName } from './utils/help';

class Indexer {
  /**
   *  @param source current file id
   *  @param id imported file path
   *  for example:
   *  in AddToDo.lg:
   *   [import](../common/common.lg)
   *
   * source = AddToDo.lg  || AddToDo
   * id = ../common/common.lg  || common.lg || common
   */
  private _lgImportResolver = (files: FileInfo[]) => {
    const lgFiles = files;
    return (source: string, id: string) => {
      const targetId = getBaseName(id, '.lg');
      const targetFile = lgFiles.find(({ name }) => getBaseName(name, '.lg') === targetId);
      if (!targetFile) throw new Error('file not found');
      return {
        id,
        content: targetFile.content,
      };
    };
  };

  private classifyFile(files: FileInfo[]) {
    return files.reduce(
      (result, file) => {
        const extension = getExtension(file.name);
        if (extension && result[extension]) {
          result[extension].push(file);
        }
        return result;
      },
      { [FileExtensions.lg]: [], [FileExtensions.Lu]: [], [FileExtensions.Dialog]: [] }
    );
  }

  public index(files: FileInfo[], botName: string, schema: any) {
    const result = this.classifyFile(files);
    return {
      dialogs: dialogIndexer.index(result[FileExtensions.Dialog], botName, schema),
      lgFiles: lgIndexer.index(result[FileExtensions.lg], this._lgImportResolver(result[FileExtensions.lg])),
      luFiles: luIndexer.index(result[FileExtensions.Lu]),
    };
  }
}

export const indexer = new Indexer();

export * from './dialogIndexer';
export * from './lgIndexer';
export * from './luIndexer';
export * from './dialogUtils';
export * from './utils';
