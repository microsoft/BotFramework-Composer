"use strict";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCrossTrainConfig = exports.getReferredLuFiles = void 0;
/**
 * luUtil.ts is a single place use lu-parser handle lu file operation.
 * it's designed have no state, input text file, output text file.
 * for more usage detail, please check client/__tests__/utils/luUtil.test.ts
 */
const keys_1 = __importDefault(require("lodash/keys"));
const shared_1 = require("@bfc/shared");
const indexers_1 = require("@bfc/indexers");
const fileUtil_1 = require("./fileUtil");
const jsonWalk_1 = require("./jsonWalk");
function getReferredLuFiles(luFiles, dialogs, checkContent = true) {
    return luFiles.filter((file) => {
        const idWithOutLocale = fileUtil_1.getBaseName(file.id);
        return dialogs.some((dialog) => dialog.luFile === idWithOutLocale && ((checkContent && !!file.content) || !checkContent));
    });
}
exports.getReferredLuFiles = getReferredLuFiles;
function ExtractAllBeginDialogs(value) {
    const dialogs = [];
    const visitor = (path, value) => {
        if ((value === null || value === void 0 ? void 0 : value.$kind) === shared_1.SDKKinds.BeginDialog && (value === null || value === void 0 ? void 0 : value.dialog)) {
            dialogs.push(value.dialog);
            return true;
        }
        return false;
    };
    jsonWalk_1.JsonWalk('$', value, visitor);
    return dialogs;
}
// find out all properties from given dialog
function ExtractIntentTriggers(value) {
    const intentTriggers = [];
    const triggers = value === null || value === void 0 ? void 0 : value[shared_1.FieldNames.Events];
    if (triggers && triggers.length) {
        for (const trigger of triggers) {
            const dialogs = ExtractAllBeginDialogs(trigger);
            if (trigger.$kind === shared_1.SDKKinds.OnIntent && trigger.intent) {
                intentTriggers.push({ intent: trigger.intent, dialogs });
            }
            else if (trigger.$kind !== shared_1.SDKKinds.OnIntent && dialogs.length) {
                const emptyIntent = intentTriggers.find((e) => e.intent === '');
                if (emptyIntent) {
                    //remove the duplication dialogs
                    const all = new Set([...emptyIntent.dialogs, ...dialogs]);
                    emptyIntent.dialogs = Array.from(all);
                }
                else {
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
function getLuFilesByDialogId(dialogId, luFiles) {
    return luFiles.filter((lu) => fileUtil_1.getBaseName(lu.id) === dialogId).map((lu) => createConfigId(lu.id));
}
function getFileLocale(fileName) {
    //file name = 'a.en-us.lu'
    return fileUtil_1.getExtension(fileUtil_1.getBaseName(fileName));
}
//replace the dialogId with luFile's name
function addLocaleToConfig(config, luFiles) {
    const { rootIds, triggerRules } = config;
    config.rootIds = rootIds.reduce((result, id) => {
        return [...result, ...getLuFilesByDialogId(id, luFiles)];
    }, []);
    config.triggerRules = keys_1.default(triggerRules).reduce((result, key) => {
        const fileNames = getLuFilesByDialogId(key, luFiles);
        return Object.assign(Object.assign({}, result), fileNames.reduce((result, name) => {
            const locale = getFileLocale(name);
            const triggers = triggerRules[key];
            keys_1.default(triggers).forEach((trigger) => {
                if (!result[name])
                    result[name] = {};
                const ids = triggers[trigger];
                if (Array.isArray(ids)) {
                    result[name][trigger] = ids.map((id) => (id ? `${id}.${locale}.lu` : id));
                }
                else {
                    result[name][trigger] = ids ? `${ids}.${locale}.lu` : ids;
                }
            });
            return result;
        }, {}));
    }, {});
    return config;
}
function parse(dialog) {
    const { id, content, isRoot } = dialog;
    const luFile = typeof content.recognizer === 'string' ? fileUtil_1.getBaseName(id) : '';
    const qnaFile = typeof content.recognizer === 'string' ? fileUtil_1.getBaseName(id) : '';
    return {
        id: fileUtil_1.getBaseName(id),
        isRoot: isRoot,
        content,
        luFile: luFile,
        qnaFile: qnaFile,
        intentTriggers: ExtractIntentTriggers(content),
    };
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
function createCrossTrainConfig(dialogs, luFilesInfo, luFeatures = {}) {
    const triggerRules = {};
    const countMap = {};
    const wrapDialogs = [];
    for (const dialog of dialogs) {
        wrapDialogs.push(parse(dialog));
    }
    const luFiles = indexers_1.luIndexer.index(luFilesInfo, luFeatures);
    //map all referred lu files
    luFiles.forEach((file) => {
        countMap[fileUtil_1.getBaseName(file.id)] = 1;
    });
    let rootId = '';
    let botName = '';
    wrapDialogs.forEach((dialog) => {
        if (dialog.isRoot) {
            rootId = dialog.id;
            botName = dialog.content.$designer.name;
        }
        if (luFiles.find((luFile) => fileUtil_1.getBaseName(luFile.id) === dialog.luFile)) {
            const { intentTriggers } = dialog;
            const fileId = dialog.id;
            //find the trigger's dialog that use a recognizer
            intentTriggers.forEach((item) => {
                //find all dialogs in trigger that has a luis recognizer
                const used = item.dialogs.filter((dialog) => !!countMap[dialog]);
                const deduped = Array.from(new Set(used));
                const result = {};
                if (deduped.length === 1) {
                    result[item.intent] = deduped[0];
                }
                else if (deduped.length) {
                    result[item.intent] = deduped;
                }
                else {
                    result[item.intent] = '';
                }
                triggerRules[fileId] = Object.assign(Object.assign({}, triggerRules[fileId]), result);
            });
        }
    });
    const crossTrainConfig = {
        botName: botName,
        rootIds: [],
        triggerRules: {},
        intentName: '_Interruption',
        verbose: true,
    };
    crossTrainConfig.rootIds = keys_1.default(countMap).filter((key) => (countMap[key] === 0 || key === rootId) && triggerRules[key]);
    crossTrainConfig.triggerRules = triggerRules;
    return addLocaleToConfig(crossTrainConfig, luFiles);
}
exports.createCrossTrainConfig = createCrossTrainConfig;
//# sourceMappingURL=crossTrainUtil.js.map