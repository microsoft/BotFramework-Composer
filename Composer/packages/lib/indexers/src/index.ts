// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { DialogSetting, FileInfo, lgImportResolverGenerator } from '@bfc/shared';

import { recognizerIndexer } from './recognizerIndexer';
import { dialogIndexer } from './dialogIndexer';
import { dialogSchemaIndexer } from './dialogSchemaIndexer';
import { jsonSchemaFileIndexer } from './jsonSchemaFileIndexer';
import { lgIndexer } from './lgIndexer';
import { luIndexer } from './luIndexer';
import { qnaIndexer } from './qnaIndexer';
import { skillManifestIndexer } from './skillManifestIndexer';
import { botProjectSpaceIndexer } from './botProjectSpaceIndexer';
import { FileExtensions } from './utils/fileExtensions';
import { getExtension, getBaseName } from './utils/help';
import { formDialogSchemaIndexer } from './formDialogSchemaIndexer';
import { crossTrainConfigIndexer } from './crossTrainConfigIndexer';
import { BotIndexer } from './botIndexer';

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

  private getLgImportResolver = (files: FileInfo[], locale: string) => {
    const lgFiles = files.map(({ name, content }) => {
      return {
        id: getBaseName(name, '.lg'),
        content,
      };
    });

    return lgImportResolverGenerator(lgFiles, '.lg', locale);
  };

  //TODO: specify locale to index is not work for multilang bot
  public index(files: FileInfo[], botName: string, locale: string, settings: DialogSetting) {
    const result = this.classifyFile(files);
    const luFeatures = settings.luFeatures;
    const { dialogs, recognizers } = this.separateDialogsAndRecognizers(result[FileExtensions.Dialog]);
    const { skillManifestFiles, crossTrainConfigs } = this.separateConfigAndManifests(result[FileExtensions.Manifest]);
    const assets = {
      dialogs: dialogIndexer.index(dialogs, botName),
      dialogSchemas: dialogSchemaIndexer.index(result[FileExtensions.DialogSchema]),
      lgFiles: lgIndexer.index(result[FileExtensions.lg], this.getLgImportResolver(result[FileExtensions.lg], locale)),
      luFiles: luIndexer.index(result[FileExtensions.Lu], luFeatures),
      qnaFiles: qnaIndexer.index(result[FileExtensions.QnA]),
      skillManifests: skillManifestIndexer.index(skillManifestFiles),
      botProjectSpaceFiles: botProjectSpaceIndexer.index(result[FileExtensions.BotProjectSpace]),
      jsonSchemaFiles: jsonSchemaFileIndexer.index(result[FileExtensions.Json]),
      formDialogSchemas: formDialogSchemaIndexer.index(result[FileExtensions.FormDialogSchema]),
      recognizers: recognizerIndexer.index(recognizers),
      crossTrainConfig: crossTrainConfigIndexer.index(crossTrainConfigs),
    };
    const botProjectFile = assets.botProjectSpaceFiles[0];
    const diagnostics = BotIndexer.validate({ ...assets, setting: settings, botProjectFile });
    return { ...assets, diagnostics };
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
