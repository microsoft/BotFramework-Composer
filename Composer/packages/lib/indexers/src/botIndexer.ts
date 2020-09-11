// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Verify bot settings, files meet LUIS/QnA requirments.
 */

import {
  BotAssets,
  BotInfo,
  LUISLocales,
  Diagnostic,
  DiagnosticSeverity,
  LuFile,
  fetchFromSettings,
  getSkillNameFromSetting,
} from '@bfc/shared';
import difference from 'lodash/difference';
import map from 'lodash/map';

import { getLocale } from './utils/help';

// Verify bot settings, files meet LUIS/QnA requirments.
const checkLUISLocales = (assets: BotAssets): Diagnostic[] => {
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

// Verify bot skill setting.
const checkSkillSetting = (assets: BotAssets): Diagnostic[] => {
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

const index = (name: string, assets: BotAssets): BotInfo => {
  const diagnostics: Diagnostic[] = [];
  diagnostics.push(...checkLUISLocales(assets), ...checkSkillSetting(assets));

  return {
    name,
    assets,
    diagnostics,
  };
};

const filterLUISFilesToPublish = (luFiles: LuFile[]): LuFile[] => {
  return luFiles.filter((file) => {
    const locale = getLocale(file.id);
    return locale && LUISLocales.includes(locale);
  });
};

export const BotIndexer = {
  index,
  checkLUISLocales,
  checkSkillSetting,
  filterLUISFilesToPublish,
};
