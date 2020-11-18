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
  fetchFromSettings,
  SkillManifestFile,
  DialogInfo,
  DialogSetting,
  LgFile,
  QnAFile,
} from '@bfc/shared';
import difference from 'lodash/difference';
import map from 'lodash/map';

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

  let useLUIS = false;
  let useQnA = false;
  dialogs.forEach((item) => {
    const luFileName = item.luFile;
    if (luFileName) {
      const luFileId = luFileName.replace(/\.lu$/, '');
      luFiles
        .filter(({ id }) => getBaseName(id) === luFileId)
        .forEach((item) => {
          if (!item.empty) useLUIS = true;
        });
    }

    const qnaFileName = item.qnaFile;
    if (qnaFileName) {
      const qnaFileId = qnaFileName.replace(/\.qna$/, '').replace(/\.lu$/, '');
      qnaFiles
        .filter(({ id }) => getBaseName(id) === qnaFileId)
        .forEach((item) => {
          if (!item.empty) useQnA = true;
        });
    }
  });

  // if use LUIS, check LUIS authoringKey key
  if (useLUIS) {
    if (!get(setting, 'luis.authoringKey')) {
      diagnostics.push(new Diagnostic('Missing LUIS key', 'appsettings.json', DiagnosticSeverity.Error));
    }
  }

  // if use QnA, check QnA subscriptionKey
  if (useQnA) {
    if (!get(setting, 'qna.subscriptionKey')) {
      diagnostics.push(
        new Diagnostic('Missing QnA Maker subscription key', 'appsettings.json', DiagnosticSeverity.Error)
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
 * 1. used skill not existed in setting
 * 2. appsettings.json Microsoft App Id or Skill Host Endpoint are empty
 */
const checkSkillSetting = (assets: { dialogs: DialogInfo[]; setting: DialogSetting }): Diagnostic[] => {
  const {
    setting: { skill = {}, botId, skillHostEndpoint },
    dialogs,
  } = assets;
  const diagnostics: Diagnostic[] = [];

  let skillUsed = false;
  dialogs.forEach((dialog) => {
    // used skill not existed in setting
    dialog.skills.forEach((skillId) => {
      const endpointUrlCollection = map(skill, ({ endpointUrl }) => endpointUrl);
      if (!endpointUrlCollection.includes(fetchFromSettings(skillId, assets.setting))) {
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
    if (dialog.skills.length) skillUsed = true;
  });

  // use skill require fill bot endpoint in skill page.
  if (skillUsed && (!botId || !skillHostEndpoint)) {
    diagnostics.push(
      new Diagnostic(
        'appsettings.json Microsoft App Id or Skill Host Endpoint are empty',
        'appsettings.json',
        DiagnosticSeverity.Warning
      )
    );
  }

  return diagnostics;
};

const validate = (assets: {
  dialogs: DialogInfo[];
  lgFiles: LgFile[];
  luFiles: LuFile[];
  qnaFiles: QnAFile[];
  setting: DialogSetting;
  skillManifests: SkillManifestFile[];
}): Diagnostic[] => {
  return [...checkManifest(assets), ...checkSetting(assets), ...checkLUISLocales(assets), ...checkSkillSetting(assets)];
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
};
