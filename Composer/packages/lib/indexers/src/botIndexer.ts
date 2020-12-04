// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Verify bot settings, files meet LUIS/QnA requirments.
 */
import get from 'lodash/get';
import {
  LUISLocales,
  Diagnostic,
  DiagnosticSeverity,
  LuFile,
  getSkillNameFromSetting,
  SkillManifestFile,
  DialogInfo,
  DialogSetting,
  LgFile,
  QnAFile,
  BotProjectFile,
  SDKKinds,
} from '@bfc/shared';
import difference from 'lodash/difference';

import { getBaseName, getLocale } from './utils/help';

/**
 * Check skill manifest.json.
 * 1. Manifest should exist
 */
const checkManifest = (assets: { skillManifests: SkillManifestFile[] }): Diagnostic[] => {
  const { skillManifests } = assets;

  const diagnostics: Diagnostic[] = [];
  if (skillManifests.length === 0) {
    diagnostics.push(new Diagnostic('Missing skill manifest', 'manifest.json', DiagnosticSeverity.Warning));
  }
  return diagnostics;
};

const shouldUseLuis = (dialogs: DialogInfo[], luFiles: LuFile[]): boolean => {
  let useLUIS = false;
  dialogs.forEach((dialogItem) => {
    const luFileName = dialogItem.luFile;
    if (luFileName) {
      const luFileId = luFileName.replace(/\.lu$/, '');
      luFiles
        .filter(({ id }) => getBaseName(id) === luFileId)
        .forEach((item) => {
          if (!item.empty && (dialogItem.luProvider === undefined || dialogItem.luProvider === SDKKinds.LuisRecognizer))
            useLUIS = true;
        });
    }
  });
  return useLUIS;
};

const shouldUseQnA = (dialogs: DialogInfo[], qnaFiles: QnAFile[]): boolean => {
  let useQnA = false;
  dialogs.forEach((dialogItem) => {
    const qnaFileName = dialogItem.qnaFile;
    if (qnaFileName) {
      const qnaFileId = qnaFileName.replace(/\.qna$/, '').replace(/\.lu$/, '');
      qnaFiles
        .filter(({ id }) => getBaseName(id) === qnaFileId)
        .forEach((item) => {
          if (!item.empty) {
            useQnA = true;
          }
        });
    }
  });
  return useQnA;
};

/**
 * Check skill appsettings.json.
 * 1. Missing LUIS key
 * 2. Missing QnA Maker subscription key.
 */
const checkSetting = (assets: {
  dialogs: DialogInfo[];
  lgFiles: LgFile[];
  luFiles: LuFile[];
  qnaFiles: QnAFile[];
  setting: DialogSetting;
}): Diagnostic[] => {
  const { dialogs, setting, luFiles, qnaFiles } = assets;
  const diagnostics: Diagnostic[] = [];

  const useLUIS = shouldUseLuis(dialogs, luFiles);
  const useQnA = shouldUseQnA(dialogs, qnaFiles);

  // if use LUIS, check LUIS authoring key
  if (useLUIS) {
    if (!get(setting, 'luis.authoringKey')) {
      diagnostics.push(new Diagnostic('Missing LUIS key', 'appsettings.json', DiagnosticSeverity.Error, '#luisKey'));
    }
  }

  // if use LUIS, check LUIS authoring region
  if (useLUIS) {
    if (!get(setting, 'luis.authoringRegion')) {
      diagnostics.push(
        new Diagnostic('Missing LUIS region', 'appsettings.json', DiagnosticSeverity.Error, '#luisRegion')
      );
    }
  }

  // if use QnA, check QnA subscription key
  if (useQnA) {
    if (!get(setting, 'qna.subscriptionKey')) {
      diagnostics.push(
        new Diagnostic('Missing QnA Maker subscription key', 'appsettings.json', DiagnosticSeverity.Error, '#qnaKey')
      );
    }
  }

  return diagnostics;
};

/**
 * Check bot settings & dialog
 * files meet LUIS/QnA requirments.
 */
const checkLUISLocales = (assets: { dialogs: DialogInfo[]; setting: DialogSetting }): Diagnostic[] => {
  const {
    dialogs,
    setting: { languages },
  } = assets;

  // if use LUIS, continue
  const useLUIS = dialogs.some((item) => !!item.luFile);
  if (!useLUIS) return [];

  const unsupportedLocales = difference(languages, LUISLocales);
  return unsupportedLocales.map((locale) => {
    return new Diagnostic(`locale ${locale} is not supported by LUIS`, 'appsettings.json', DiagnosticSeverity.Warning);
  });
};

/**
 * Check bot skill & setting
 * 1. used skill not existed in *.botproj
 */
const checkSkillSetting = (assets: { dialogs: DialogInfo[]; botProjectFile: BotProjectFile }): Diagnostic[] => {
  const { botProjectFile, dialogs } = assets;
  const diagnostics: Diagnostic[] = [];
  const skillNames = Object.keys(botProjectFile.content?.skills || {});
  dialogs.forEach((dialog) => {
    // used skill not existed in setting
    dialog.skills.forEach((skillId) => {
      if (!skillNames.includes(skillId)) {
        const skillName = getSkillNameFromSetting(skillId) || skillId;
        diagnostics.push(
          new Diagnostic(
            `The skill '${skillName}' does not exist in in appsettings.json`,
            dialog.id,
            DiagnosticSeverity.Error
          )
        );
      }
    });
  });

  return diagnostics;
};

const validate = (assets: {
  dialogs: DialogInfo[];
  lgFiles: LgFile[];
  luFiles: LuFile[];
  qnaFiles: QnAFile[];
  setting: DialogSetting;
  skillManifests: SkillManifestFile[];
  botProjectFile: BotProjectFile;
  isRemote?: boolean;
  isRootBot?: boolean;
}): Diagnostic[] => {
  if (assets.isRemote) return [];
  const settingDiagnostics = [...checkSetting(assets), ...checkLUISLocales(assets), ...checkSkillSetting(assets)];
  if (assets.isRootBot) return settingDiagnostics;
  return [...checkManifest(assets), ...settingDiagnostics];
};

const filterLUISFilesToPublish = (luFiles: LuFile[]): LuFile[] => {
  return luFiles.filter((file) => {
    const locale = getLocale(file.id);
    return locale && LUISLocales.includes(locale);
  });
};

export const BotIndexer = {
  validate,
  checkManifest,
  checkSetting,
  checkLUISLocales,
  checkSkillSetting,
  filterLUISFilesToPublish,
  shouldUseLuis,
  shouldUseQnA,
};
