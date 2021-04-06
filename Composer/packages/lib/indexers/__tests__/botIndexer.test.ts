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
  QnAFile,
  SDKKinds,
} from '@bfc/shared';

import { BotIndexer } from '../src/botIndexer';
const {
  checkManifest,
  checkSetting,
  checkSkillSetting,
  checkLUISLocales,
  checkQnALocales,
  filterLUISFilesToPublish,
  filterQnAFilesToPublish,
} = BotIndexer;

const botAssets: BotAssets = {
  projectId: 'test',
  botProjectFile: {
    id: 'test',
    content: {
      name: '',
      skills: {
        'Email-Skill': {
          workspace: '',
          remote: false,
        },
      },
    },
    lastModified: '',
  },
  jsonSchemaFiles: [],
  recognizers: [],
  formDialogSchemas: [],
  crossTrainConfig: {},
  dialogSchemas: [],
  qnaFiles: [],
  lgFiles: [],
  luFiles: [
    {
      id: 'a.en-us',
      empty: false,
    } as LuFile,
    {
      id: 'a.zh-cn',
      empty: true,
    } as LuFile,
    {
      id: 'a.ar',
      empty: true,
    } as LuFile,
  ],
  skillManifests: [],
  dialogs: [
    {
      luFile: 'a.lu',
      skills: ['Email-Skill', 'Calendar-Skill'],
      luProvider: SDKKinds.LuisRecognizer,
    } as DialogInfo,
  ],
  setting: {
    languages: ['en-us', 'zh-cn', 'af'],
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
  it('LUIS authoringKey should exist in setting', () => {
    const diagnostics = checkSetting(botAssets);
    expect(diagnostics.length).toEqual(1);
  });

  it('LUIS authoringKey should exist in setting', () => {
    const mergedSettings = {
      ...botAssets.setting,
      luis: { authoringKey: '4d210acc6d794d71a2a3450*****2fb7', endpointKey: '' } as ILuisConfig,
    };
    const diagnostics = checkSetting({ ...botAssets, setting: mergedSettings });
    expect(diagnostics.length).toEqual(0);
  });

  it('QnA subscriptionKey should exist in setting, when qna file is not empty', () => {
    const botAssets2 = {
      ...botAssets,
      dialogs: [
        {
          luFile: 'a.lu',
          qnaFile: 'a.lu.qna',
        } as DialogInfo,
      ],
      qnaFiles: [
        {
          id: 'a.en-us',
          empty: false,
        } as QnAFile,
      ],
    };
    const diagnostics = checkSetting(botAssets2);
    expect(diagnostics.length).toEqual(2);
  });

  it('QnA subscriptionKey should exist in setting, when qna file is empty', () => {
    const botAssets2 = {
      ...botAssets,
      dialogs: [
        {
          luFile: 'a.lu',
          qnaFile: 'a.lu.qna',
        } as DialogInfo,
      ],
    };
    const diagnostics = checkSetting(botAssets2);
    expect(diagnostics.length).toEqual(1);
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

describe('checkQnALocales', () => {
  it('should check qna not supported locales', () => {
    const diagnostics = checkQnALocales(botAssets);
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
    expect(warnings.length).toEqual(0);
  });
});

describe('filterLUISFilesToPublish', () => {
  it('should filter luFiles left LUIS supported locale file', () => {
    const luFilesToPublish = filterLUISFilesToPublish(botAssets.luFiles, botAssets.dialogs);
    expect(luFilesToPublish.length).toEqual(2);
    expect(luFilesToPublish).not.toContain({
      id: 'a.af',
    });
  });

  it('should not filter locales for Orchestrator', () => {
    const botAssetsOrch = {
      ...botAssets,
      luFiles: [
        {
          id: 'a.es',
          empty: false,
        } as LuFile,
        {
          id: 'b.es',
          empty: false,
        } as LuFile,
      ],
      dialogs: [
        {
          luFile: 'a',
          luProvider: SDKKinds.OrchestratorRecognizer,
        } as DialogInfo,
        {
          luFile: 'b',
          luProvider: SDKKinds.LuisRecognizer,
        } as DialogInfo,
      ],
    };

    const luFilesToPublish = filterLUISFilesToPublish(botAssetsOrch.luFiles, botAssetsOrch.dialogs);
    expect(luFilesToPublish.length).toEqual(1);
    expect(luFilesToPublish).not.toContainEqual({
      id: 'b.es',
      empty: false,
    });
    expect(luFilesToPublish).toContainEqual({
      id: 'a.es',
      empty: false,
    });
  });
  describe('filterQnAFilesToPublish', () => {
    it('should filter qnaFiles left QnA supported locale file', () => {
      const qnaFilesToPublish = filterQnAFilesToPublish(botAssets.qnaFiles, botAssets.dialogs);
      expect(qnaFilesToPublish.length).toEqual(2);
      expect(qnaFilesToPublish).not.toContain({
        id: 'a.af',
      });
    });
  });
});
