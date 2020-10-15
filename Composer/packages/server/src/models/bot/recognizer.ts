// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { SDKKinds } from '@bfc/shared';

import { IFileStorage } from '../storage/interface';

export type UpdateRecognizer = (
  target: string,
  fileNames: string[],
  storage: IFileStorage,
  options: { defalutLanguage?: string; folderPath?: string }
) => Promise<void> | void;

export type RecognizerType = SDKKinds.CrossTrainedRecognizerSet | SDKKinds.LuisRecognizer | string;
export type RecognizerTypes = { [fileName: string]: RecognizerType };

type GeneratedDialog = { name: string; content: string };

const LuisRecognizerTemplate = (target: string, fileName: string) => ({
  $kind: SDKKinds.LuisRecognizer,
  id: `LUIS_${target}`,
  applicationId: `=settings.luis.${fileName.replace(/[.-]/g, '_')}.appId`,
  version: `=settings.luis.${fileName.replace(/[.-]/g, '_')}.version`,
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

const getMultiLanguagueRecognizerDialog = (target: string, luFileNames: string[], defalutLanguage = 'en-us') => {
  const multiLanguageRecognizer = MultiLanguageRecognizerTemplate(target);

  luFileNames.forEach((item) => {
    const local = getLuFileLocal(item);
    multiLanguageRecognizer.recognizers[local] = item;
    if (local === defalutLanguage) {
      multiLanguageRecognizer.recognizers[''] = item;
    }
  });

  return { name: `${target}.lu.dialog`, content: JSON.stringify(multiLanguageRecognizer, null, 2) };
};

const getCrossTrainedRecognizerDialog = (target: string, fileNames: string[]) => {
  const crossTrainedRecognizer = CrossTrainedRecognizerTemplate();

  if (fileNames.some((item) => item.endsWith('.qna'))) {
    crossTrainedRecognizer.recognizers.push(`${target}.qna`);
  }

  if (fileNames.some((item) => item.endsWith('.lu'))) {
    crossTrainedRecognizer.recognizers.push(`${target}.lu`);
  }

  return {
    name: `${target}.lu.qna.dialog`,
    content: JSON.stringify(crossTrainedRecognizer, null, 2),
  };
};

const getLuisRecognizerDialogs = (target: string, luFileNames: string[]) => {
  return luFileNames.map((item) => {
    const local = getLuFileLocal(item);
    return {
      name: `${target}.${local}.lu.dialog`,
      content: JSON.stringify(LuisRecognizerTemplate(target, item), null, 2),
    };
  });
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
const updateRecognizers = (isCrosstrain: boolean): UpdateRecognizer => async (
  target: string,
  fileNames: string[],
  storage: IFileStorage,
  { defalutLanguage, folderPath }
) => {
  const luFileNames = fileNames.filter((item) => item.endsWith('.lu'));
  const multiLanguageRecognizerDialog = getMultiLanguagueRecognizerDialog(target, luFileNames, defalutLanguage);
  const luisRecognizersDialogs = getLuisRecognizerDialogs(target, luFileNames);
  const needUpdateDialogs: GeneratedDialog[] = [];
  const needPreserveDialogs: GeneratedDialog[] = [];

  if (isCrosstrain) {
    const crossTrainedRecognizerDialog = getCrossTrainedRecognizerDialog(target, fileNames);
    needUpdateDialogs.push(crossTrainedRecognizerDialog);
  }

  luisRecognizersDialogs.forEach((item) => {
    needPreserveDialogs.push(item);
  });

  if (luisRecognizersDialogs.length) {
    needUpdateDialogs.push(multiLanguageRecognizerDialog);
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

export const updateCrossTrained: UpdateRecognizer = updateRecognizers(true);

export const updateLuis: UpdateRecognizer = updateRecognizers(false);

/**
 * RegexRecognizer now remove all the files
 * ToDo: CustomRecognizer now remove all the files
 */
export const removeRecognizers: UpdateRecognizer = async (
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

const recognizers: { [key in RecognizerType]: UpdateRecognizer } = {
  'Microsoft.CrossTrainedRecognizerSet': updateCrossTrained,
  'Microsoft.LuisRecognizer': updateLuis,
  Default: removeRecognizers,
};

export default recognizers;
