// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { FileInfo } from '@bfc/shared';

import { recognizerIndexer } from './recognizerIndexer';
import { dialogIndexer } from './dialogIndexer';
import { dialogSchemaIndexer } from './dialogSchemaIndexer';
import { jsonSchemaFileIndexer } from './jsonSchemaFileIndexer';
import { skillManifestIndexer } from './skillManifestIndexer';
import { botProjectSpaceIndexer } from './botProjectSpaceIndexer';
import { FileExtensions } from './utils/fileExtensions';
import { getExtension, getBaseName } from './utils/help';
import { formDialogSchemaIndexer } from './formDialogSchemaIndexer';
import { crossTrainConfigIndexer } from './crossTrainConfigIndexer';

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
        [FileExtensions.FormDialogSchema]: [],
        [FileExtensions.QnA]: [],
        [FileExtensions.Dialog]: [],
        [FileExtensions.DialogSchema]: [],
        [FileExtensions.Manifest]: [],
        [FileExtensions.BotProjectSpace]: [],
        [FileExtensions.CrossTrainConfig]: [],
      }
    );
  }

  private separateDialogsAndRecognizers = (files: FileInfo[]) => {
    return files.reduce(
      (result: { dialogs: FileInfo[]; recognizers: FileInfo[] }, file) => {
        if (file.name.endsWith('.lu.dialog') || file.name.endsWith('.qna.dialog')) {
          result.recognizers.push(file);
        } else {
          result.dialogs.push(file);
        }
        return result;
      },
      { dialogs: [], recognizers: [] }
    );
  };

  private separateConfigAndManifests = (files: FileInfo[]) => {
    return files.reduce(
      (result: { crossTrainConfigs: FileInfo[]; skillManifestFiles: FileInfo[] }, file) => {
        if (file.name.endsWith('.config.json')) {
          result.crossTrainConfigs.push(file);
        } else {
          result.skillManifestFiles.push(file);
        }
        return result;
      },
      { crossTrainConfigs: [], skillManifestFiles: [] }
    );
  };

  private getResources = (files: FileInfo[], extension: string) => {
    return files.map(({ name, content }) => ({
      id: getBaseName(name, extension),
      content,
    }));
  };

  public index(files: FileInfo[], botName: string) {
    const result = this.classifyFile(files);
    const { dialogs, recognizers } = this.separateDialogsAndRecognizers(result[FileExtensions.Dialog]);
    const { skillManifestFiles, crossTrainConfigs } = this.separateConfigAndManifests(result[FileExtensions.Manifest]);
    const assets = {
      dialogs: dialogIndexer.index(dialogs, botName),
      dialogSchemas: dialogSchemaIndexer.index(result[FileExtensions.DialogSchema]),
      lgResources: this.getResources(result[FileExtensions.lg], FileExtensions.lg),
      luResources: this.getResources(result[FileExtensions.Lu], FileExtensions.Lu),
      qnaResources: this.getResources(result[FileExtensions.QnA], FileExtensions.QnA),
      skillManifests: skillManifestIndexer.index(skillManifestFiles),
      botProjectSpaceFiles: botProjectSpaceIndexer.index(result[FileExtensions.BotProjectSpace]),
      jsonSchemaFiles: jsonSchemaFileIndexer.index(result[FileExtensions.Json]),
      formDialogSchemas: formDialogSchemaIndexer.index(result[FileExtensions.FormDialogSchema]),
      recognizers: recognizerIndexer.index(recognizers),
      crossTrainConfig: crossTrainConfigIndexer.index(crossTrainConfigs),
    };
    return { ...assets };
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
export * from './extractSchemaProperties';
export * from './groupTriggers';
