// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo, LuFile } from '@bfc/shared';

import { LuisConfig, QnaConfig } from '../constants';

import { getReferredLuFiles } from './luUtil';
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

    languages.forEach((language) => {
      const triggers = filtered.reduce((result, { intent, dialogs }) => {
        const ids = dialogs
          .map((dialog) => createConfigId(dialog, language))
          .filter((id) => luFiles.some((file) => `${file.id}` === id));
        if (!ids.length && dialogs.length) return result;
        result[intent] = ids;
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
  if (getReferredLuFiles(luFiles, dialogs).length > 0) {
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

// return true if dialogs have one with default recognizer.
export function needsBuild(dialogs) {
  return dialogs.some((dialog) => typeof dialog.content.recognizer === 'string');
}

export function createRecognizerTypeMap(dialogs: DialogInfo[]) {}
