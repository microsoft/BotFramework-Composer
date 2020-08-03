// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * luUtil.ts is a single place use lu-parser handle lu file operation.
 * it's designed have no state, input text file, output text file.
 * for more usage detail, please check client/__tests__/utils/luUtil.test.ts
 */
import keys from 'lodash/keys';
import { LuFile, DialogInfo, IIntentTrigger, FieldNames, SDKKinds, FileInfo } from '@bfc/shared';
import { luIndexer } from '@bfc/indexers';

import { getBaseName, getExtension } from './fileUtil';
import { VisitorFunc, JsonWalk } from './jsonWalk';

export function getReferredLuFiles(luFiles: LuFile[], dialogs: DialogInfo[], checkContent = true) {
  return luFiles.filter((file) => {
    const idWithOutLocale = getBaseName(file.id);
    return dialogs.some(
      (dialog) => dialog.luFile === idWithOutLocale && ((checkContent && !!file.content) || !checkContent)
    );
  });
}

function ExtractAllBeginDialogs(value: any): string[] {
  const dialogs: string[] = [];

  const visitor: VisitorFunc = (path: string, value: any): boolean => {
    if (value?.$kind === SDKKinds.BeginDialog && value?.dialog) {
      dialogs.push(value.dialog);
      return true;
    }
    return false;
  };

  JsonWalk('$', value, visitor);

  return dialogs;
}

// find out all properties from given dialog
function ExtractIntentTriggers(value: any): IIntentTrigger[] {
  const intentTriggers: IIntentTrigger[] = [];
  const triggers = value?.[FieldNames.Events];

  if (triggers && triggers.length) {
    for (const trigger of triggers) {
      const dialogs = ExtractAllBeginDialogs(trigger);

      if (trigger.$kind === SDKKinds.OnIntent && trigger.intent) {
        intentTriggers.push({ intent: trigger.intent, dialogs });
      } else if (trigger.$kind !== SDKKinds.OnIntent && dialogs.length) {
        const emptyIntent = intentTriggers.find((e) => e.intent === '');
        if (emptyIntent) {
          //remove the duplication dialogs
          const all = new Set<string>([...emptyIntent.dialogs, ...dialogs]);
          emptyIntent.dialogs = Array.from(all);
        } else {
          intentTriggers.push({ intent: '', dialogs });
        }
      }
    }
  }

  return intentTriggers;
}

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

function parse(dialog) {
  const { id, content, isRoot } = dialog;
  const luFile = typeof content.recognizer === 'string' ? getBaseName(id) : '';
  const qnaFile = typeof content.recognizer === 'string' ? getBaseName(id) : '';

  return {
    id: getBaseName(id),
    isRoot: isRoot,
    content,
    luFile: luFile,
    qnaFile: qnaFile,
    intentTriggers: ExtractIntentTriggers(content),
  };
}
export interface ICrossTrainConfig {
  rootIds: string[];
  triggerRules: { [key: string]: any };
  intentName: string;
  verbose: boolean;
  botName: string;
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
export function createCrossTrainConfig(dialogs: any[], luFilesInfo: FileInfo[]): ICrossTrainConfig {
  const triggerRules = {};
  const countMap = {};
  const wrapDialogs: { [key: string]: any }[] = [];
  for (const dialog of dialogs) {
    wrapDialogs.push(parse(dialog));
  }

  const luFiles = luIndexer.index(luFilesInfo);

  //map all referred lu files
  luFiles.forEach((file) => {
    countMap[getBaseName(file.id)] = 1;
  });

  let rootId = '';
  let botName = '';
  wrapDialogs.forEach((dialog) => {
    if (dialog.isRoot) {
      rootId = dialog.id;
      botName = dialog.content.$designer.name;
    }

    if (luFiles.find((luFile) => getBaseName(luFile.id) === dialog.luFile)) {
      const { intentTriggers } = dialog;
      const fileId = dialog.id;
      //find the trigger's dialog that use a recognizer
      intentTriggers.forEach((item) => {
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
    botName: botName,
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
