// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * luUtil.ts is a single place use lu-parser handle lu file operation.
 * it's designed have no state, input text file, output text file.
 * for more usage detail, please check client/__tests__/utils/luUtil.test.ts
 */
import keys from 'lodash/keys';
import { createSingleMessage } from '@bfc/indexers';
import { LuFile, DialogInfo, DiagnosticSeverity } from '@bfc/shared';

import { getBaseName, getExtension } from './fileUtil';

export * from '@bfc/indexers/lib/utils/luUtil';

export function getReferredFiles(luFiles: LuFile[], dialogs: DialogInfo[]) {
  return luFiles.filter(file => {
    const idWithOutLocale = getBaseName(file.id);
    return !!~dialogs.findIndex(dialog => dialog.luFile === idWithOutLocale);
  });
}

function createConfigId(fileId) {
  return `${fileId}.lu`;
}

function getLuFilesByDialogId(dialogId: string, luFiles: LuFile[]) {
  return luFiles.filter(lu => getBaseName(lu.id) === dialogId).map(lu => createConfigId(lu.id));
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
        keys(triggers).forEach(trigger => {
          if (!result[name]) result[name] = {};
          const ids = triggers[trigger];
          if (Array.isArray(ids)) {
            result[name][trigger] = ids.map(id => (id ? `${id}.${locale}.lu` : id));
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
  luFiles.forEach(file => {
    countMap[getBaseName(file.id)] = 1;
  });

  let rootId = '';
  dialogs.forEach(dialog => {
    if (dialog.isRoot) rootId = dialog.id;

    const { intentTriggers } = dialog;
    const fileId = dialog.id;
    //find the trigger's dialog that use a recognizer
    intentTriggers.forEach(item => {
      //find all dialogs in trigger that has a luis recognizer
      const used = item.dialogs.filter(dialog => !!countMap[dialog]);

      const deduped = Array.from(new Set<string>(used));

      const result = {};
      if (deduped.length === 1) {
        result[item.intent] = deduped[0];
      } else if (deduped.length) {
        result[item.intent] = deduped;
      }

      if (!item.dialogs.length) result[item.intent] = '';
      triggerRules[fileId] = { ...triggerRules[fileId], ...result };
    });
  });

  const crossTrainConfig: ICrossTrainConfig = {
    rootIds: [],
    triggerRules: {},
    intentName: '_Interruption',
    verbose: true,
  };
  crossTrainConfig.rootIds = keys(countMap).filter(key => (countMap[key] === 0 || key === rootId) && triggerRules[key]);
  crossTrainConfig.triggerRules = triggerRules;
  return addLocaleToConfig(crossTrainConfig, luFiles);
}

function generateErrorMessage(invalidLuFile: LuFile[]) {
  return invalidLuFile.reduce((msg, file) => {
    const fileErrorText = file.diagnostics.reduce((text, diagnostic) => {
      text += `\n ${createSingleMessage(diagnostic)}`;
      return text;
    }, `In ${file.id}.lu: `);
    msg += `\n ${fileErrorText} \n`;
    return msg;
  }, '');
}

function isLuFileEmpty(file: LuFile) {
  const { content, intents } = file;
  if (content && intents?.length) {
    return false;
  }
  return true;
}

export function checkLuisPublish(luFiles: LuFile[], dialogs: DialogInfo[]) {
  const referred = getReferredFiles(luFiles, dialogs);
  const invalidLuFile = referred.filter(
    file => file.diagnostics.filter(n => n.severity === DiagnosticSeverity.Error).length !== 0
  );
  if (invalidLuFile.length !== 0) {
    const msg = generateErrorMessage(invalidLuFile);
    throw new Error(`The Following LuFile(s) are invalid: \n` + msg);
  }
  const emptyLuFiles = referred.filter(isLuFileEmpty);
  if (emptyLuFiles.length !== 0) {
    const msg = emptyLuFiles.map(file => file.id).join(' ');
    throw new Error(`You have the following empty LuFile(s): ` + msg);
  }
  return referred;
}
