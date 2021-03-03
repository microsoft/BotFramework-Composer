// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotIndexer } from '@bfc/indexers';
import { selectorFamily, selector } from 'recoil';
import lodashGet from 'lodash/get';
import formatMessage from 'format-message';

import { getReferredLuFiles } from '../../utils/luUtil';
import { INavTreeItem } from '../../components/NavTree';
import { botDisplayNameState, dialogIdsState, qnaFilesState } from '../atoms/botState';
import {
  DialogDiagnostic,
  LgDiagnostic,
  LuDiagnostic,
  DiagnosticInfo,
  QnADiagnostic,
  BotDiagnostic,
  SettingDiagnostic,
  SkillSettingDiagnostic,
} from '../../pages/diagnostics/types';
import {
  botDiagnosticsState,
  botProjectFileState,
  botProjectIdsState,
  dialogSchemasState,
  jsonSchemaFilesState,
  luFilesState,
  projectMetaDataState,
  settingsState,
  skillManifestsState,
} from '../atoms';

import { crossTrainConfigState } from './../atoms/botState';
import { formDialogSchemasSelectorFamily, rootBotProjectIdSelector } from './project';
import { recognizersSelectorFamily } from './recognizers';
import { dialogDiagnosticsSelectorFamily, dialogsWithLuProviderSelectorFamily } from './validatedDialogs';
import { lgFilesSelectorFamily } from './lg';

export const botAssetsSelectFamily = selectorFamily({
  key: 'botAssetsSelectFamily',
  get: (projectId: string) => ({ get }) => {
    const projectsMetaData = get(projectMetaDataState(projectId));
    if (!projectsMetaData || projectsMetaData.isRemote) return null;

    const dialogs = get(dialogsWithLuProviderSelectorFamily(projectId));
    const luFiles = get(luFilesState(projectId));
    const lgFiles = get(lgFilesSelectorFamily(projectId));
    const setting = get(settingsState(projectId));
    const skillManifests = get(skillManifestsState(projectId));
    const dialogSchemas = get(dialogSchemasState(projectId));
    const qnaFiles = get(qnaFilesState(projectId));
    const formDialogSchemas = get(formDialogSchemasSelectorFamily(projectId));
    const botProjectFile = get(botProjectFileState(projectId));
    const jsonSchemaFiles = get(jsonSchemaFilesState(projectId));
    const recognizers = get(recognizersSelectorFamily(projectId));
    const crossTrainConfig = get(crossTrainConfigState(projectId));
    return {
      projectId,
      dialogs,
      luFiles,
      qnaFiles,
      lgFiles,
      skillManifests,
      setting,
      dialogSchemas,
      formDialogSchemas,
      botProjectFile,
      jsonSchemaFiles,
      recognizers,
      crossTrainConfig,
    };
  },
});

export const botDiagnosticsSelectorFamily = selectorFamily({
  key: 'botDiagnosticsSelectorFamily',
  get: (projectId: string) => ({ get }) => {
    const botAssets = get(botAssetsSelectFamily(projectId));
    if (botAssets === null) return [];

    const rootProjectId = get(rootBotProjectIdSelector) ?? projectId;
    const diagnostics = get(botDiagnosticsState(projectId));
    const diagnosticList: DiagnosticInfo[] = [];

    diagnostics.forEach((d) => {
      diagnosticList.push(new BotDiagnostic(rootProjectId, projectId, '', d.source, d));
    });

    //manifest.json
    //Manifest should exist
    if (rootProjectId !== projectId) {
      BotIndexer.checkManifest(botAssets).forEach((d) => {
        diagnosticList.push(new BotDiagnostic(rootProjectId, projectId, '', d.source, d));
      });
    }

    return diagnosticList;
  },
});

/**
 * Check bot skill & setting
 * 1. used skill not existed in setting
 * 2. appsettings.json Microsoft App Id or Skill Host Endpoint are empty
 */
export const skillSettingDiagnosticsSelectorFamily = selectorFamily({
  key: 'skillDiagnosticsSelectorFamily',
  get: (projectId: string) => ({ get }) => {
    const botAssets = get(botAssetsSelectFamily(projectId));
    if (botAssets === null) return [];

    const rootProjectId = get(rootBotProjectIdSelector) ?? projectId;
    const diagnosticList: DiagnosticInfo[] = [];

    const skillDiagnostics = BotIndexer.checkSkillSetting(botAssets);
    skillDiagnostics.forEach((item) => {
      diagnosticList.push(new SkillSettingDiagnostic(rootProjectId, projectId, item.source, item.source, item));
    });
    return diagnosticList;
  },
});

export const settingDiagnosticsSelectorFamily = selectorFamily({
  key: 'settingDiagnosticsSelectorFamily',
  get: (projectId: string) => ({ get }) => {
    const botAssets = get(botAssetsSelectFamily(projectId));
    if (botAssets === null) return [];

    const rootProjectId = get(rootBotProjectIdSelector) ?? projectId;
    const rootSetting = get(settingsState(rootProjectId));
    const diagnosticList: DiagnosticInfo[] = [];

    //1. Missing LUIS key
    //2. Missing QnA Maker subscription key.
    //appsettings.json
    const settingDiagnostic = BotIndexer.checkSetting(botAssets, rootSetting);
    settingDiagnostic.forEach((item) => {
      diagnosticList.push(new SettingDiagnostic(rootProjectId, projectId, item.source, item.source, item));
    });

    //Check bot settings & dialog
    //files meet LUIS/QnA requirments.
    //appsettings.json
    const luisLocaleDiagnostics = BotIndexer.checkLUISLocales(botAssets);

    luisLocaleDiagnostics.forEach((item) => {
      diagnosticList.push(new SettingDiagnostic(rootProjectId, projectId, item.source, item.source, item));
    });

    return diagnosticList;
  },
});

export const dialogsDiagnosticsSelectorFamily = selectorFamily({
  key: 'dialogsDiagnosticsSelectorFamily',
  get: (projectId: string) => ({ get }) => {
    const botAssets = get(botAssetsSelectFamily(projectId));
    if (botAssets === null) return [];

    const rootProjectId = get(rootBotProjectIdSelector) ?? projectId;
    const dialogIds = get(dialogIdsState(projectId));
    const diagnosticList: DiagnosticInfo[] = [];

    dialogIds.forEach((dialogId: string) => {
      const diagnostics = get(dialogDiagnosticsSelectorFamily({ projectId, dialogId })) || [];
      diagnostics.forEach((diagnostic) => {
        const location = `${dialogId}.dialog`;
        diagnosticList.push(new DialogDiagnostic(rootProjectId, projectId, dialogId, location, diagnostic));
      });
    });

    return [];
  },
});

export const luDiagnosticsSelectorFamily = selectorFamily({
  key: 'luDiagnosticsSelectorFamily',
  get: (projectId: string) => ({ get }) => {
    const botAssets = get(botAssetsSelectFamily(projectId));
    if (botAssets === null) return [];

    const rootProjectId = get(rootBotProjectIdSelector) ?? projectId;
    const diagnosticList: DiagnosticInfo[] = [];
    const { luFiles, dialogs } = botAssets;

    getReferredLuFiles(luFiles, dialogs).forEach((lufile) => {
      lufile.diagnostics.forEach((diagnostic) => {
        const location = `${lufile.id}.lu`;
        diagnosticList.push(
          new LuDiagnostic(rootProjectId, projectId, lufile.id, location, diagnostic, lufile, dialogs)
        );
      });
    });

    return diagnosticList;
  },
});

export const lgDiagnosticsSelectorFamily = selectorFamily({
  key: 'lgDiagnosticsSelectorFamily',
  get: (projectId: string) => ({ get }) => {
    const botAssets = get(botAssetsSelectFamily(projectId));
    if (botAssets === null) return [];

    const { lgFiles, dialogs } = botAssets;
    const rootProjectId = get(rootBotProjectIdSelector) ?? projectId;
    const diagnosticList: DiagnosticInfo[] = [];

    lgFiles.forEach((lgFile) => {
      lgFile.diagnostics.forEach((diagnostic) => {
        const location = `${lgFile.id}.lg`;
        diagnosticList.push(
          new LgDiagnostic(rootProjectId, projectId, lgFile.id, location, diagnostic, lgFile, dialogs)
        );
      });
    });

    return diagnosticList;
  },
});

export const qnaDiagnosticsSelectorFamily = selectorFamily({
  key: 'qnaDiagnosticsSelectorFamily',
  get: (projectId: string) => ({ get }) => {
    const botAssets = get(botAssetsSelectFamily(projectId));
    if (botAssets === null) return [];

    const { qnaFiles } = botAssets;
    const rootProjectId = get(rootBotProjectIdSelector) ?? projectId;
    const diagnosticList: DiagnosticInfo[] = [];

    qnaFiles.forEach((qnaFile) => {
      lodashGet(qnaFile, 'diagnostics', []).forEach((diagnostic) => {
        const location = `${qnaFile.id}.qna`;
        diagnosticList.push(new QnADiagnostic(rootProjectId, projectId, qnaFile.id, location, diagnostic));
      });
    });

    return diagnosticList;
  },
});

export const diagnosticsSelectorFamily = selectorFamily({
  key: 'diagnosticsSelector',
  get: (projectId: string) => ({ get }) => [
    ...get(dialogsDiagnosticsSelectorFamily(projectId)),
    ...get(botDiagnosticsSelectorFamily(projectId)),
    ...get(skillSettingDiagnosticsSelectorFamily(projectId)),
    ...get(settingDiagnosticsSelectorFamily(projectId)),
    ...get(luDiagnosticsSelectorFamily(projectId)),
    ...get(lgDiagnosticsSelectorFamily(projectId)),
    ...get(qnaDiagnosticsSelectorFamily(projectId)),
  ],
});

export const allDiagnosticsSelectorFamily = selectorFamily({
  key: 'allDiagnosticsSelector',
  get: (type: 'Error' | 'Warning' | 'All') => ({ get }) => {
    const ids = get(botProjectIdsState);
    const result = ids.reduce((result: DiagnosticInfo[], id: string) => {
      return [
        ...result,
        ...get(diagnosticsSelectorFamily(id)).filter((diagnostic) => type === 'All' || diagnostic.severity === type),
      ];
    }, []);
    return result;
  },
});

export const diagnosticNavLinksSelector = selector({
  key: 'diagnosticNavLinksSelector',
  get: ({ get }) => {
    const projectId = get(rootBotProjectIdSelector);
    const ids = get(botProjectIdsState);
    const result = ids.reduce((result: INavTreeItem[], id: string) => {
      const projectsMetaData = get(projectMetaDataState(id));
      if (projectsMetaData.isRemote) return result;
      const name = get(botDisplayNameState(id));
      const url = id === projectId ? `/bot/${projectId}/diagnostics` : `/bot/${projectId}/skill/${id}/diagnostics`;
      result.push({
        id: id,
        name: name,
        ariaLabel: formatMessage('diagnostic links'),
        url,
      });
      return result;
    }, []);

    return result;
  },
});
