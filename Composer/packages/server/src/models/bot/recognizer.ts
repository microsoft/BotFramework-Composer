// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { RecognizerType, SDKKinds } from '@bfc/shared';

import { IFileStorage } from '../storage/interface';

export type UpdateRecognizer = (
  target: string,
  fileNames: string[],
  storage: IFileStorage,
  options: { defalutLanguage?: string; folderPath?: string }
) => Promise<void> | void;

export type RecognizerTypes = { [fileName: string]: RecognizerType };

type GeneratedDialog = { name: string; content: string };

const LuisRecognizerTemplate = (target: string, fileName: string) => ({
  $kind: SDKKinds.LuisRecognizer,
  id: `LUIS_${target}`,
  applicationId: `=settings.luis.${fileName.replace('.', '_')}`,
  endpoint: '=settings.luis.endpoint',
  endpointKey: '=settings.luis.endpointKey',
});

const MultiLanguageRecognizerTemplate = (target: string) => ({
  $kind: SDKKinds.MultiLanguageRecognizer,
  id: `LUIS_${target}`,
  recognizers: {},
});

const CrossTrainedRecognizerTemplate = (): {
  $kind: string;
  recognizers: string[];
} => ({
  $kind: SDKKinds.CrossTrainedRecognizerSet,
  recognizers: [],
});

//in composer the luFile name is a.local.lu
const getLuFileLocal = (fileName: string) => {
  const items = fileName.split('.');
  return items[items.length - 2];
};

/**
 * DefaultRecognizer:
 *  luisRecoginzers: create and preserve(exists)
 *  multiLanguageRecognizer: update the recognizers
 *  crossTrainedRecognizer: update the recognizers
 *
 * @param target the dialog Id
 * @param fileNames the lu and qna files name list
 * @param folderPath the recognizers folder's path
 */
export const updateDefault: UpdateRecognizer = async (
  target: string,
  fileNames: string[],
  storage: IFileStorage,
  { defalutLanguage, folderPath }
) => {
  const multiLanguageRecognizers = MultiLanguageRecognizerTemplate(target);
  const crossTrainedRecognizers = CrossTrainedRecognizerTemplate();
  const needUpdateDialogs: GeneratedDialog[] = [];
  const needPreserveDialogs: GeneratedDialog[] = [];

  if (fileNames.some((item) => item.endsWith('.qna'))) {
    crossTrainedRecognizers.recognizers.push(`${target}.qna`);
  }

  const luFileNames = fileNames.filter((item) => item.endsWith('.lu'));

  if (luFileNames.length) {
    crossTrainedRecognizers.recognizers.push(`${target}.lu`);
  }

  luFileNames.forEach((item) => {
    const local = getLuFileLocal(item);
    needPreserveDialogs.push({
      name: `${target}.${local}.lu.dialog`,
      content: JSON.stringify(LuisRecognizerTemplate(target, item), null, 2),
    });
    multiLanguageRecognizers.recognizers[local] = item;
    if (local === defalutLanguage) {
      multiLanguageRecognizers.recognizers[''] = item;
    }
  });

  //The multiLanguageRecognizer and crossTrainedRecognizer need to check update every time
  needUpdateDialogs.push({
    name: `${target}.lu.qna.dialog`,
    content: JSON.stringify(crossTrainedRecognizers, null, 2),
  });

  if (luFileNames.length) {
    needUpdateDialogs.push({ name: `${target}.lu.dialog`, content: JSON.stringify(multiLanguageRecognizers, null, 2) });
  }

  const previousFilePaths = await storage.glob(`${target}.*`, folderPath ?? '');
  const currentFiles = [...needUpdateDialogs, ...needPreserveDialogs];

  //if remove a local, need to delete these files
  const needDeleteFiles = previousFilePaths.filter((item) => !currentFiles.some((file) => file.name === item));
  const needupdateFiles = needUpdateDialogs.concat(
    needPreserveDialogs.filter((item) => !previousFilePaths.some((path) => path === item.name))
  );

  await Promise.all(
    needDeleteFiles.map(async (fileName) => {
      return await storage.removeFile(`${folderPath}/${fileName}`);
    })
  );

  await Promise.all(
    needupdateFiles.map(async (item) => {
      return await storage.writeFile(`${folderPath}/${item.name}`, item.content);
    })
  );
};

/**
 * RegexRecognizer now remove all the files
 */
export const updateRegex: UpdateRecognizer = async (
  target: string,
  fileNames: string[],
  storage: IFileStorage,
  { folderPath }
) => {
  const filePaths = await storage.glob(`${target}.*`, folderPath ?? '');

  await Promise.all(
    filePaths.map(async (fileName) => {
      return await storage.removeFile(`${folderPath}/${fileName}`);
    })
  );
};

/**
 * ToDo: CustomRecognizer now remove all the files
 */
export const updateCustom: UpdateRecognizer = async (
  target: string,
  fileNames: string[],
  storage: IFileStorage,
  { folderPath }
) => {
  await updateRegex(target, fileNames, storage, { folderPath });
};

const recognizers: { [key in RecognizerType]: UpdateRecognizer } = {
  DefaultRecognizer: updateDefault,
  RegexRecognizer: updateRegex,
  CustomRecognizer: updateCustom,
};

export default recognizers;
