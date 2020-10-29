// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotIndexer } from '@bfc/indexers';
import { BotAssets } from '@bfc/shared';
import { selectorFamily, selector } from 'recoil';
import lodashGet from 'lodash/get';
import formatMessage from 'format-message';

import { getReferredLuFiles } from '../../utils/luUtil';
import { INavTreeItem } from '../../components/NavTree';
import { botDisplayNameState, qnaFilesState } from '../atoms/botState';
import { currentProjectIdState } from '../atoms/appState';
import {
  DialogDiagnostic,
  LgDiagnostic,
  LuDiagnostic,
  DiagnosticInfo,
  QnADiagnostic,
  ServerDiagnostic,
  SettingDiagnostic,
  SkillDiagnostic,
} from '../../pages/diagnostics/types';
import {
  botDiagnosticsState,
  botProjectFileState,
  botProjectIdsState,
  dialogSchemasState,
  jsonSchemaFilesState,
  lgFilesState,
  luFilesState,
  projectMetaDataState,
  settingsState,
  skillManifestsState,
} from '../atoms';

import { formDialogSchemasSelectorFamily } from './project';
import { validateDialogsSelectorFamily } from './validatedDialogs';

export const diagnosticsSelector = selectorFamily({
  key: 'diagnosticsSelector',
  get: (projectId: string) => ({ get }) => {
    const projectsMetaData = get(projectMetaDataState(projectId));
    if (!projectsMetaData || projectsMetaData.isRemote) return [];

    const dialogs = get(validateDialogsSelectorFamily(projectId));
    const luFiles = get(luFilesState(projectId));
    const lgFiles = get(lgFilesState(projectId));
    const diagnostics = get(botDiagnosticsState(projectId));
    const setting = get(settingsState(projectId));
    const skillManifests = get(skillManifestsState(projectId));
    const dialogSchemas = get(dialogSchemasState(projectId));
    const qnaFiles = get(qnaFilesState(projectId));
    const formDialogSchemas = get(formDialogSchemasSelectorFamily(projectId));
    const botProjectFile = get(botProjectFileState(projectId));
    const jsonSchemaFiles = get(jsonSchemaFilesState(projectId));

    const botAssets: BotAssets = {
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
    };

    const diagnosticList: DiagnosticInfo[] = [];
    diagnostics.forEach((d) => {
      diagnosticList.push(new ServerDiagnostic(projectId, '', d.source, d));
    });
    const skillDiagnostics = BotIndexer.checkSkillSetting(botAssets);
    skillDiagnostics.forEach((item) => {
      if (item.source.endsWith('.json')) {
        diagnosticList.push(new SkillDiagnostic(projectId, item.source, item.source, item));
      } else {
        diagnosticList.push(new DialogDiagnostic(projectId, item.source, item.source, item));
      }
    });
    const luisLocaleDiagnostics = BotIndexer.checkLUISLocales(botAssets);

    luisLocaleDiagnostics.forEach((item) => {
      diagnosticList.push(new SettingDiagnostic(projectId, item.source, item.source, item));
    });

    dialogs.forEach((dialog) => {
      dialog.diagnostics.forEach((diagnostic) => {
        const location = `${dialog.id}.dialog`;
        diagnosticList.push(new DialogDiagnostic(projectId, dialog.id, location, diagnostic));
      });
    });
    getReferredLuFiles(luFiles, dialogs).forEach((lufile) => {
      lufile.diagnostics.forEach((diagnostic) => {
        const location = `${lufile.id}.lu`;
        diagnosticList.push(new LuDiagnostic(projectId, lufile.id, location, diagnostic, lufile, dialogs));
      });
    });
    lgFiles.forEach((lgFile) => {
      lgFile.diagnostics.forEach((diagnostic) => {
        const location = `${lgFile.id}.lg`;
        diagnosticList.push(new LgDiagnostic(projectId, lgFile.id, location, diagnostic, lgFile, dialogs));
      });
    });
    qnaFiles.forEach((qnaFile) => {
      lodashGet(qnaFile, 'diagnostics', []).forEach((diagnostic) => {
        const location = `${qnaFile.id}.qna`;
        diagnosticList.push(new QnADiagnostic(projectId, qnaFile.id, location, diagnostic));
      });
    });
    return diagnosticList;
  },
});

export const startAllBotEnableSelector = selector({
  key: 'startAllBotEnableSelector',
  get: ({ get }) => {
    const ids = get(botProjectIdsState);
    const result = ids.reduce((result: DiagnosticInfo[], id: string) => {
      return [...result, ...get(diagnosticsSelector(id)).filter((diagnostic) => diagnostic.severity === 'Error')];
    }, []);
    return !result.length;
  },
});

export const allDiagnosticsSelector = selector({
  key: 'allDiagnosticsSelector',
  get: ({ get }) => {
    const ids = get(botProjectIdsState);
    const result = ids.reduce((result: DiagnosticInfo[], id: string) => {
      return [...result, ...get(diagnosticsSelector(id))];
    }, []);
    return result;
  },
});

export const diagnosticNavLinksSelector = selector({
  key: 'diagnosticNavLinksSelector',
  get: ({ get }) => {
    const projectId = get(currentProjectIdState);
    const ids = get(botProjectIdsState);
    const result = ids.reduce((result: INavTreeItem[], id: string) => {
      const projectsMetaData = get(projectMetaDataState(id));
      if (projectsMetaData.isRemote) return result;
      const name = get(botDisplayNameState(id));
      result.push({
        id: id,
        name: name,
        ariaLabel: formatMessage('diagnostic links'),
        url: `/bot/${projectId}/skill/${id}/diagnostics`,
      });
      return result;
    }, []);

    return result;
  },
});
