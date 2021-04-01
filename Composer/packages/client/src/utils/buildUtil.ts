// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo, LuFile, LUISLocales, QnAFile, SDKKinds } from '@bfc/shared';

import { LuisConfig, QnaConfig } from '../constants';

import { getLuisBuildLuFiles } from './luUtil';
import { getReferredQnaFiles } from './qnaUtil';
import { getBaseName } from './fileUtil';

function createConfigId(fileId: string, language: string) {
  return `${fileId}.${language}`;
}

export function createCrossTrainConfig(dialogs: DialogInfo[], luFiles: LuFile[], languages: string[]) {
  const config = dialogs.reduce((result, { isRoot: rootDialog, intentTriggers, id, luFile: luFileId }) => {
    const luFile = luFiles.find((luFile) => getBaseName(luFile.id) === luFileId);

    if (!luFile) return result;

    const filtered = intentTriggers.filter((intentTrigger) =>
      luFile.intents.find((intent) => intent.Name === intentTrigger.intent || intentTrigger.intent === '')
    );

    if (!filtered.length) return result;

    languages
      .filter((item) => LUISLocales.includes(item))
      .forEach((language) => {
        const triggers = filtered.reduce((result, { intent, dialogs }) => {
          const ids = dialogs
            .map((dialog) => createConfigId(dialog, language))
            .filter((id) => luFiles.some((file) => `${file.id}` === id));
          if (!ids.length && dialogs.length) return result;
          result[intent] = ids.length ? ids : '';
          return result;
        }, {});
        result[createConfigId(id, language)] = { rootDialog, triggers };
      });

    return result;
  }, {});

  return config;
}

export function isBuildConfigComplete(config, dialogs, luFiles, qnaFiles) {
  let complete = true;
  if (getLuisBuildLuFiles(luFiles, dialogs).length > 0) {
    if (Object.values(LuisConfig).some((luisConfigKey) => config.luis[luisConfigKey] === '')) {
      complete = false;
    }
  }
  if (getReferredQnaFiles(qnaFiles, dialogs).length > 0) {
    if (Object.values(QnaConfig).some((qnaConfigKey) => config.qna[qnaConfigKey] === '')) {
      complete = false;
    }
  }
  return complete;
}

export function isKeyRequired(dialogs: DialogInfo[], luFiles: LuFile[], qnaFiles: QnAFile[]) {
  return getLuisBuildLuFiles(luFiles, dialogs).length || getReferredQnaFiles(qnaFiles, dialogs).length;
}

// return true if dialogs have one with default recognizer.
export function needsBuild(dialogs) {
  return dialogs.some((dialog) => typeof dialog.content.recognizer === 'string');
}

//ToDo: every recognizer need to get recognizer type from the dialog's recognizer field.
//now CrossTrainedRecognizerSet and LuisRecognizer's recognizer is abbreviated
//as recognizer: '***.lu.qna'
export function getRecognizerTypes(dialogs: DialogInfo[]) {
  return dialogs.reduce((result: { [key: string]: any }, { id, content }) => {
    const { recognizer } = content;
    if (typeof recognizer === 'string') {
      if (recognizer.endsWith('.lu.qna')) {
        result[id] = SDKKinds.CrossTrainedRecognizerSet;
      }
      if (recognizer.endsWith('.lu')) {
        result[id] = SDKKinds.LuisRecognizer;
      }
    } else {
      result[id] = '';
    }
    return result;
  }, {});
}
