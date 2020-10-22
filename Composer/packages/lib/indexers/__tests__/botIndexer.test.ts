// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BotAssets,
  DialogSetting,
  DialogInfo,
  DiagnosticSeverity,
  LuFile,
  ILuisConfig,
  ILUFeaturesConfig,
  IQnAConfig,
  SkillSetting,
} from '@bfc/shared';

import { BotIndexer } from '../src/botIndexer';
const { checkManifest, checkSetting, checkSkillSetting, checkLUISLocales, filterLUISFilesToPublish } = BotIndexer;

const botAssets: BotAssets = {
  projectId: 'test',
  botProjectFile: {
    id: 'test',
    content: {
      workspace: '',
      name: '',
      skills: {},
    },
    lastModified: '',
  },
  dialogSchemas: [],
  qnaFiles: [],
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
      skills: [`=settings.skill['Email-Skill'].endpointUrl`, `=settings.skill['Calendar-Skill'].endpointUrl`],
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
        msAppId: 'skill1',
        endpointUrl: 'skill1',
      } as SkillSetting,
    },
    luis: {} as ILuisConfig,
    luFeatures: {} as ILUFeaturesConfig,
    qna: {} as IQnAConfig,
    runtime: {} as any,
  } as DialogSetting,
};

describe('check manifest', () => {
  it('manifest file should exist', () => {
    const diagnostics = checkManifest(botAssets);
    expect(diagnostics.length).toEqual(1);
  });
});

describe('check LUIS & QnA key', () => {
  it('LUIS authoringKey shoud exsit in setting', () => {
    const diagnostics = checkSetting(botAssets, {});
    expect(diagnostics.length).toEqual(1);
  });

  it('LUIS authoringKey shoud exsit in setting or locale storage', () => {
    const diagnostics = checkSetting(botAssets, {
      MicrosoftAppPassword: '',
      luis: {
        authoringKey: '4d210acc6d794d71a2a3450*****2fb7',
        endpointKey: '',
      },
      qna: {
        authoringKey: '',
        endpointKey: '',
      },
    });
    expect(diagnostics.length).toEqual(0);
  });

  it('QnA subscriptionKey shoud exsit in setting', () => {
    const botAssets2 = {
      ...botAssets,
      dialogs: [
        {
          luFile: 'a.lu',
          qnaFile: 'a.lu.qna',
        } as DialogInfo,
      ],
    };
    const diagnostics = checkSetting(botAssets2, {});
    expect(diagnostics.length).toEqual(2);
  });

  it('QnA subscriptionKe shoud exsit in setting or locale storage', () => {
    const botAssets2 = {
      ...botAssets,
      dialogs: [
        {
          luFile: 'a.lu',
          qnaFile: 'a.lu.qna',
        } as DialogInfo,
      ],
    };
    const diagnostics = checkSetting(botAssets2, {
      MicrosoftAppPassword: '',
      luis: {
        authoringKey: '4d210acc6d794d71a2a3450*****2fb7',
        endpointKey: '',
      },
      qna: {
        subscriptionKey: '4d210acc6d794d71a2a3450*****2fb7',
        endpointKey: '',
      },
    });
    expect(diagnostics.length).toEqual(0);
  });
});

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
