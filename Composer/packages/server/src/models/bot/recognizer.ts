// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { RecognizerType, SDKKinds } from '@bfc/shared';

import { IFileStorage } from '../storage/interface';

export type UpdateRecognizer = (
  target: string,
  fileNames: string[],
  storage: IFileStorage,
  options: { defalutLanguage?: string; folderPath?: string }
) => void;

export type RecognizerTypes = { [fileName: string]: RecognizerType };

type GeneratedDialog = { name: string; content: string };

const LuisRecognizerTemplate = (target: string, fileName: string) => ({
  $kind: 'Microsoft.LuisRecognizer',
  id: `LUIS_${target}`,
  applicationId: `=settings.luis.${fileName.replace('.', '_')}`,
  endpoint: '=settings.luis.endpoint',
  endpointKey: '=settings.luis.endpointKey',
});

const MultiLanguageRecognizerTemplate = (target: string) => ({
  $kind: 'Microsoft.MultiLanguageRecognizer',
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

const getLuFileLocal = (fileName: string) => {
  const items = fileName.split('.');
  return items[items.length - 2];
};

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

  needUpdateDialogs.push({
    name: `${target}.lu.qna.dialog`,
    content: JSON.stringify(crossTrainedRecognizers, null, 2),
  });

  if (luFileNames.length) {
    needUpdateDialogs.push({ name: `${target}.lu.dialog`, content: JSON.stringify(multiLanguageRecognizers, null, 2) });
  }

  const previousFilePaths = await storage.glob(`${target}.*`, folderPath ?? '');
  const currentFiles = [...needUpdateDialogs, ...needPreserveDialogs];

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

export const updateRegex: UpdateRecognizer = () => {};

export const updateCustom: UpdateRecognizer = () => {};

const recognizers: { [key in RecognizerType]: UpdateRecognizer } = {
  DefaultRecognizer: updateDefault,
  RegexRecognizer: updateRegex,
  CustomRecognizer: updateCustom,
};

export default recognizers;
