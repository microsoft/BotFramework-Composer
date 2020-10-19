// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { DialogSetting, FileInfo, lgImportResolverGenerator } from '@bfc/shared';
import { LGResource } from 'botbuilder-lg';

import { dialogIndexer } from './dialogIndexer';
import { dialogSchemaIndexer } from './dialogSchemaIndexer';
import { jsonSchemaFileIndexer } from './jsonSchemaFileIndexer';
import { lgIndexer } from './lgIndexer';
import { luIndexer } from './luIndexer';
import { qnaIndexer } from './qnaIndexer';
import { skillIndexer } from './skillIndexer';
import { skillManifestIndexer } from './skillManifestIndexer';
import { botProjectSpaceIndexer } from './botProjectSpaceIndexer';
import { FileExtensions } from './utils/fileExtensions';
import { getExtension, getBaseName } from './utils/help';
import { formDialogSchemaIndexer } from './formDialogSchemaIndexer';

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
        [FileExtensions.FormDialog]: [],
        [FileExtensions.QnA]: [],
        [FileExtensions.Dialog]: [],
        [FileExtensions.DialogSchema]: [],
        [FileExtensions.Manifest]: [],
        [FileExtensions.BotProjectSpace]: [],
      }
    );
  }

  private getLgImportResolver = (files: FileInfo[], locale: string) => {
    const lgResources = files.map(({ name, content }) => {
      const id = getBaseName(name, '.lg');
      return new LGResource(id, id, content);
    });

    return lgImportResolverGenerator(lgResources, '.lg', locale);
  };

  public index(files: FileInfo[], botName: string, locale: string, skillContent: any, settings: DialogSetting) {
    const result = this.classifyFile(files);
    const luFeatures = settings.luFeatures;
    return {
      dialogs: dialogIndexer.index(result[FileExtensions.Dialog], botName),
      dialogSchemas: dialogSchemaIndexer.index(result[FileExtensions.DialogSchema]),
      lgFiles: lgIndexer.index(result[FileExtensions.lg], this.getLgImportResolver(result[FileExtensions.lg], locale)),
      luFiles: luIndexer.index(result[FileExtensions.Lu], luFeatures),
      qnaFiles: qnaIndexer.index(result[FileExtensions.QnA]),
      skillManifestFiles: skillManifestIndexer.index(result[FileExtensions.Manifest]),
      skills: skillIndexer.index(skillContent, settings.skill),
      botProjectSpaceFiles: botProjectSpaceIndexer.index(result[FileExtensions.BotProjectSpace]),
      jsonSchemaFiles: jsonSchemaFileIndexer.index(result[FileExtensions.Json]),
      formDialogSchemas: formDialogSchemaIndexer.index(result[FileExtensions.FormDialog]),
    };
  }
}

export const indexer = new Indexer();

export * from './botIndexer';
export * from './dialogIndexer';
export * from './dialogSchemaIndexer';
export * from './lgIndexer';
export * from './luIndexer';
export * from './qnaIndexer';
export * from './utils';
export * from './validations';
export * from './skillIndexer';
export * from './botProjectSpaceIndexer';
