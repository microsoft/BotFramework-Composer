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

const MultiLanguageRecognizerTemplate = (target: string, fileType: 'lu' | 'qna') => ({
  $kind: SDKKinds.MultiLanguageRecognizer,
  id: `${fileType === 'lu' ? 'LUIS' : 'QnA'}_${target}`,
  recognizers: {},
});

const CrossTrainedRecognizerTemplate = (): {
  $kind: string;
  recognizers: string[];
} => ({
  $kind: SDKKinds.CrossTrainedRecognizerSet,
  recognizers: [],
});

const QnAMakerRecognizerTemplate = (target: string, fileName: string) => ({
  $kind: SDKKinds.QnAMakerRecognizer,
  id: `QnA_${target}`,
  knowledgeBaseId: `=settings.qna.${fileName.replace(/[.-]/g, '_')}`,
  hostname: '=settings.qna.hostname',
  endpointKey: '=settings.qna.endpointKey',
});

//in composer the luFile name is a.locale.lu
export const getLuFileLocale = (fileName: string) => {
  const items = fileName.split('.');
  return items[items.length - 2];
};

export const getMultiLanguagueRecognizerDialog = (
  target: string,
  fileNames: string[],
  fileType: 'lu' | 'qna',
  defalutLanguage = 'en-us'
) => {
  const multiLanguageRecognizer = MultiLanguageRecognizerTemplate(target, fileType);

  fileNames.forEach((name) => {
    if (!name.startsWith(target)) return;
    const locale = getLuFileLocale(name);
    multiLanguageRecognizer.recognizers[locale] = name;
    if (locale === defalutLanguage) {
      multiLanguageRecognizer.recognizers[''] = name;
    }
  });

  return { name: `${target}.${fileType}.dialog`, content: JSON.stringify(multiLanguageRecognizer, null, 2) };
};

export const getCrossTrainedRecognizerDialog = (target: string, fileNames: string[]) => {
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

export const getLuisRecognizerDialogs = (target: string, luFileNames: string[]) => {
  return luFileNames.map((item) => {
    const locale = getLuFileLocale(item);
    return {
      name: `${target}.${locale}.lu.dialog`,
      content: JSON.stringify(LuisRecognizerTemplate(target, item), null, 2),
    };
  });
};

export const getQnaMakerRecognizerDialogs = (target: string, qnaFileNames: string[]) => {
  return qnaFileNames.map((item) => {
    const locale = getLuFileLocale(item);
    return {
      name: `${target}.${locale}.qna.dialog`,
      content: JSON.stringify(QnAMakerRecognizerTemplate(target, item), null, 2),
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
export const updateRecognizers = (isCrosstrain: boolean): UpdateRecognizer => async (
  target: string,
  fileNames: string[],
  storage: IFileStorage,
  { defalutLanguage, folderPath }
) => {
  const luFileNames = fileNames.filter((item) => item.endsWith('.lu'));
  const qnaFileNames = fileNames.filter((item) => item.endsWith('.qna') && !item.endsWith('.source.qna'));
  const luMultiLanguageRecognizerDialog = getMultiLanguagueRecognizerDialog(target, luFileNames, 'lu', defalutLanguage);
  const qnaMultiLanguageRecognizerDialog = getMultiLanguagueRecognizerDialog(
    target,
    qnaFileNames,
    'qna',
    defalutLanguage
  );
  const luisRecognizersDialogs = getLuisRecognizerDialogs(target, luFileNames);
  const qnaMakeRecognizersDialogs = getQnaMakerRecognizerDialogs(target, qnaFileNames);
  const needUpdateDialogs: GeneratedDialog[] = [];
  let needPreserveDialogs: GeneratedDialog[] = [];

  if (isCrosstrain) {
    const crossTrainedRecognizerDialog = getCrossTrainedRecognizerDialog(target, fileNames);
    needUpdateDialogs.push(crossTrainedRecognizerDialog);

    if (qnaMakeRecognizersDialogs.length) {
      needUpdateDialogs.push(qnaMultiLanguageRecognizerDialog);
    }

    needPreserveDialogs = [...needPreserveDialogs, ...qnaMakeRecognizersDialogs];
  }

  needPreserveDialogs = [...needPreserveDialogs, ...luisRecognizersDialogs];

  if (luisRecognizersDialogs.length) {
    needUpdateDialogs.push(luMultiLanguageRecognizerDialog);
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
