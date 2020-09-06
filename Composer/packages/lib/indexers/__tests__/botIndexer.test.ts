// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotAssets, DialogSetting, DialogInfo, DiagnosticSeverity, LuFile, ILuisConfig, IQnAConfig } from '@bfc/shared';

import { BotIndexer } from '../src/botIndexer';
const { checkSkillSetting, checkLUISLocales, filterLUISFilesToPublish } = BotIndexer;

const botAssets: BotAssets = {
  projectId: 'test',
  lgFiles: [],
  luFiles: [
    {
      id: 'a.en-us',
    } as LuFile,
    {
      id: 'a.zh-cn',
    } as LuFile,
    {
      id: 'a.ar',
    } as LuFile,
  ],
  skillManifests: [],
  dialogs: [
    {
      luFile: 'a.lu',
      skills: ['skill1', 'skill2'],
    } as DialogInfo,
  ],
  setting: {
    languages: ['en-us', 'zh-cn', 'ar'],
    defaultLanguage: 'en-us',
    botId: '',
    skillHostEndpoint: '',
    skill: {
      'Email-Skill': {
        name: 'Email-Skill',
        manifestUrl: 'skill1',
      },
    },
    luis: {} as ILuisConfig,
    qna: {} as IQnAConfig,
    runtime: {} as any,
  } as DialogSetting,
};

describe('checkLUISLocales', () => {
  it('should check luis not supported locales', () => {
    const diagnostics = checkLUISLocales(botAssets);
    const errors = diagnostics.filter((item) => item.severity === DiagnosticSeverity.Error);
    const warnings = diagnostics.filter((item) => item.severity === DiagnosticSeverity.Warning);
    expect(errors.length).toEqual(0);
    expect(warnings.length).toEqual(1);
  });
});

describe('checkSkillSetting', () => {
  it('should check skill are missing', () => {
    const diagnostics = checkSkillSetting(botAssets);
    const errors = diagnostics.filter((item) => item.severity === DiagnosticSeverity.Error);
    const warnings = diagnostics.filter((item) => item.severity === DiagnosticSeverity.Warning);
    expect(errors.length).toEqual(1);
    expect(warnings.length).toEqual(1);
  });
});

describe('filterLUISFilesToPublish', () => {
  it('should filter luFiles left LUIS supported locale file', () => {
    const luFilesToPublish = filterLUISFilesToPublish(botAssets.luFiles);
    expect(luFilesToPublish.length).toEqual(2);
    expect(luFilesToPublish).not.toContain({
      id: 'a.ar',
    });
  });
});
