// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogInfo, LuFile } from '@bfc/shared';
import keys from 'lodash/keys';

import { LuisConfig, QnaConfig } from '../constants';

import { getReferredLuFiles } from './luUtil';
import { getReferredQnaFiles } from './qnaUtil';
import { getBaseName, getExtension } from './fileUtil';

function createConfigId(fileId) {
  return `${fileId}.lu`;
}

function getLuFilesByDialogId(dialogId: string, luFiles: LuFile[]) {
  return luFiles.filter((lu) => getBaseName(lu.id) === dialogId).map((lu) => createConfigId(lu.id));
}

function getFileLocale(fileName: string) {
  //file name = 'a.en-us.lu'
  return getExtension(getBaseName(fileName));
}
//replace the dialogId with luFile's name
function addLocaleToConfig(config: ICrossTrainConfig, luFiles: LuFile[]) {
  const { rootIds, triggerRules } = config;
  config.rootIds = rootIds.reduce((result: string[], id: string) => {
    return [...result, ...getLuFilesByDialogId(id, luFiles)];
  }, []);
  config.triggerRules = keys(triggerRules).reduce((result, key) => {
    const fileNames = getLuFilesByDialogId(key, luFiles);
    return {
      ...result,
      ...fileNames.reduce((result, name) => {
        const locale = getFileLocale(name);
        const triggers = triggerRules[key];
        keys(triggers).forEach((trigger) => {
          if (!result[name]) result[name] = {};
          const ids = triggers[trigger];
          if (Array.isArray(ids)) {
            result[name][trigger] = ids.map((id) => (id ? `${id}.${locale}.lu` : id));
          } else {
            result[name][trigger] = ids ? `${ids}.${locale}.lu` : ids;
          }
        });
        return result;
      }, {}),
    };
  }, {});
  return config;
}
interface ICrossTrainConfig {
  rootIds: string[];
  triggerRules: { [key: string]: any };
  intentName: string;
  verbose: boolean;
}

//generate the cross-train config without locale
/* the config is like
  {
      rootIds: [
        'main.en-us.lu',
        'main.fr-fr.lu'
      ],
      triggerRules: {
        'main.en-us.lu': {
          'dia1_trigger': 'dia1.en-us.lu',
          'dia2_trigger': 'dia2.en-us.lu'
        },
        'dia2.en-us.lu': {
          'dia3_trigger': 'dia3.en-us.lu',
          'dia4_trigger': 'dia4.en-us.lu'
        },
        'main.fr-fr.lu': {
          'dia1_trigger': 'dia1.fr-fr.lu'
        }
      },
      intentName: '_Interruption',
      verbose: true
    }
  */

export function createCrossTrainConfig(dialogs: DialogInfo[], luFiles: LuFile[]): ICrossTrainConfig {
  const triggerRules = {};
  const countMap = {};

  //map all referred lu files
  luFiles.forEach((file) => {
    countMap[getBaseName(file.id)] = 1;
  });

  let rootId = '';
  dialogs.forEach((dialog) => {
    if (dialog.isRoot) rootId = dialog.id;
    const luFile = luFiles.find((luFile) => getBaseName(luFile.id) === dialog.luFile);
    if (luFile) {
      const fileId = dialog.id;
      const { intentTriggers } = dialog;
      // filter intenttrigger which be involved in lu file
      //find the trigger's dialog that use a recognizer
      intentTriggers
        .filter((intentTrigger) => luFile.intents.find((intent) => intent.Name === intentTrigger.intent))
        .forEach((item) => {
          //find all dialogs in trigger that has a luis recognizer
          const used = item.dialogs.filter((dialog) => !!countMap[dialog]);

          const deduped = Array.from(new Set<string>(used));

          const result = {};
          if (deduped.length === 1) {
            result[item.intent] = deduped[0];
          } else if (deduped.length) {
            result[item.intent] = deduped;
          } else {
            result[item.intent] = '';
          }

          triggerRules[fileId] = { ...triggerRules[fileId], ...result };
        });
    }
  });

  const crossTrainConfig: ICrossTrainConfig = {
    rootIds: [],
    triggerRules: {},
    intentName: '_Interruption',
    verbose: true,
  };
  crossTrainConfig.rootIds = keys(countMap).filter(
    (key) => (countMap[key] === 0 || key === rootId) && triggerRules[key]
  );
  crossTrainConfig.triggerRules = triggerRules;
  return addLocaleToConfig(crossTrainConfig, luFiles);
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
