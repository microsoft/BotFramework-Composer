// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/**
 * Verify bot settings, files meet LUIS/QnA requirments.
 */

import { BotAssets, BotInfo, LUISLocales, Diagnostic, DiagnosticSeverity } from '@bfc/shared';
import difference from 'lodash/difference';

// Verify bot settings, files meet LUIS/QnA requirments.
const checkLUISLocales = (assets: BotAssets): Diagnostic[] => {
  const {
    setting: { languages },
  } = assets;

  const unsupportedLocales = difference(languages, LUISLocales);
  return unsupportedLocales.map((locale) => {
    return new Diagnostic(`locale ${locale} is not supported by LUIS`, 'appsettings.json', DiagnosticSeverity.Warning);
  });
};

// Verify bot skill setting.
const checkSkillSetting = (assets: BotAssets): Diagnostic[] => {
  const {
    setting: { skill = [], botId, skillHostEndpoint },
    dialogs,
  } = assets;
  const diagnostics: Diagnostic[] = [];

  let skillUsed = false;
  dialogs.forEach((dialog) => {
    // used skill not existed in setting
    dialog.skills.forEach((skillId) => {
      if (skill.findIndex(({ manifestUrl }) => manifestUrl === skillId) === -1) {
        diagnostics.push(
          new Diagnostic(`skill '${skillId}' is not existed in appsettings.json`, dialog.id, DiagnosticSeverity.Error)
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
  const diagnostics = [];

  return {
    name,
    assets,
    diagnostics,
  };
};

export const BotIndexer = {
  index,
  checkLUISLocales,
  checkSkillSetting,
};
