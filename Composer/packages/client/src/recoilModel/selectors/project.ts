// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotIndexer } from '@bfc/indexers';
import { BotAssets, checkForPVASchema, DialogInfo, FormDialogSchema, JsonSchemaFile } from '@bfc/shared';
import isEmpty from 'lodash/isEmpty';
import uniqBy from 'lodash/uniqBy';
import { selector, selectorFamily } from 'recoil';

import { LanguageFileImport } from '../../../../types/src';
import { BotStatus } from '../../constants';
import {
  botDisplayNameState,
  botErrorState,
  botNameIdentifierState,
  botProjectFileState,
  botProjectIdsState,
  formDialogSchemaIdsState,
  formDialogSchemaState,
  skillManifestsState,
  dialogSchemasState,
  jsonSchemaFilesState,
  projectMetaDataState,
  settingsState,
  publishHistoryState,
  publishTypesState,
  dialogIdsState,
  dialogState,
  schemasState,
  botEndpointsState,
  localeState,
  botStatusState,
} from '../atoms';
import {
  dialogsSelectorFamily,
  botAssetsSelectFamily,
  buildEssentialsSelector,
  lgImportsSelectorFamily,
  luImportsSelectorFamily,
  luFilesSelectorFamily,
  qnaFilesSelectorFamily,
  dialogsWithLuProviderSelectorFamily,
} from '../selectors';

import { lgFilesSelectorFamily } from './lg';
// Selector return types
export type TreeDataPerProject = {
  isRemote: boolean;
  isRootBot: boolean;
  projectId: string;
  sortedDialogs: DialogInfo[];
  lgImports: Record<string, LanguageFileImport[]>;
  luImports: Record<string, LanguageFileImport[]>;
  lgImportsList: LanguageFileImport[]; // all imported file exclude form diloag
  luImportsList: LanguageFileImport[];
  name: string;
  isPvaSchema: boolean;
  formDialogSchemas: FormDialogSchema[];
  botError: any;
};

type WebChatEssentials = {
  projectId: string;
  botName: string;
  secrets: { msAppId: string; msPassword: string };
  botUrl: string;
  activeLocale: string;
  botStatus: BotStatus;
};

// Actions
export const localBotsWithoutErrorsSelector = selector({
  key: 'localBotsWithoutErrorsSelector',
  get: ({ get }) => {
    const botProjectIds = get(botProjectIdsState);
    return botProjectIds.filter((projectId: string) => {
      const { isRemote } = get(projectMetaDataState(projectId));
      const botError = get(botErrorState(projectId));
      return !isRemote && !botError;
    });
  },
});

export const localBotPublishHistorySelector = selector({
  key: 'localBotPublishHistorySelector',
  get: ({ get }) => {
    const botProjectIds = get(localBotsWithoutErrorsSelector);
    const result = {};
    botProjectIds.map((projectId: string) => {
      const publishHistory = get(publishHistoryState(projectId));
      result[projectId] = publishHistory;
    });
    return result;
  },
});
export const localBotsDataSelector = selector({
  key: 'localBotsDataSelector',
  get: ({ get }) => {
    const botProjectIds = get(localBotsWithoutErrorsSelector);
    const botProjectsWithoutError = get(botProjectSpaceSelector).filter((b) => botProjectIds.includes(b.projectId));
    return botProjectsWithoutError;
  },
});

export const localBotsSettingDataSelector = selector({
  key: 'localBotsSettingDataSelector',
  get: ({ get }) => {
    const botProjectIds = get(localBotsWithoutErrorsSelector);

    const result = botProjectIds.map((projectId: string) => {
      const setting = get(settingsState(projectId));
      return {
        projectId,
        setting,
      };
    });
    return result;
  },
});

export const formDialogSchemasSelectorFamily = selectorFamily<FormDialogSchema[], string>({
  key: 'formDialogSchemasSelector',
  get: (projectId: string) => ({ get }) => {
    const formDialogSchemaIds = get(formDialogSchemaIdsState(projectId));
    return formDialogSchemaIds.map((schemaId) => get(formDialogSchemaState({ projectId, schemaId })));
  },
});

// Given a form dialog schema, indicates if the dialog exist for it (aka is generated)
export const formDialogSchemaDialogExistsSelector = selectorFamily<boolean, { projectId: string; schemaId: string }>({
  key: 'formDialogSchemasSelector',
  get: ({ projectId, schemaId }) => ({ get }) => {
    const dialogs = get(dialogsSelectorFamily(projectId));
    return !!dialogs.find((d) => d.id === schemaId);
  },
});

// TODO: This selector would be modified and leveraged by the project tree
export const botProjectSpaceSelector = selector({
  key: 'botProjectSpaceSelector',
  get: ({ get }) => {
    const botProjects = get(botProjectIdsState);
    const result = botProjects.map((projectId: string) => {
      const { isRemote, isRootBot } = get(projectMetaDataState(projectId));
      const dialogs = get(dialogsWithLuProviderSelectorFamily(projectId));
      const luFiles = get(luFilesSelectorFamily(projectId));
      const lgFiles = get(lgFilesSelectorFamily(projectId));
      const qnaFiles = get(qnaFilesSelectorFamily(projectId));
      const formDialogSchemas = get(formDialogSchemasSelectorFamily(projectId));
      const botProjectFile = get(botProjectFileState(projectId));
      const metaData = get(projectMetaDataState(projectId));
      const botError = get(botErrorState(projectId));
      const buildEssentials = get(buildEssentialsSelector(projectId));
      const name = get(botDisplayNameState(projectId));
      const botNameId = get(botNameIdentifierState(projectId));
      const setting = get(settingsState(projectId));
      const skillManifests = get(skillManifestsState(projectId));
      const dialogSchemas = get(dialogSchemasState(projectId));
      const jsonSchemaFiles = get(jsonSchemaFilesState(projectId));
      const schemas = get(schemasState(projectId));
      const isPvaSchema = schemas && checkForPVASchema(schemas.sdk);

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
        recognizers: [],
        crossTrainConfig: {},
      };

      const diagnostics = BotIndexer.validate({ ...botAssets, isRemote, isRootBot });
      const publishTypes = get(publishTypesState(projectId));

      return {
        dialogs,
        formDialogSchemas,
        projectId,
        name,
        ...metaData,
        setting,
        error: botError,
        botNameId,
        diagnostics,
        buildEssentials,
        isPvaSchema,
        publishTypes,
        skillManifests,
      };
    });
    return result;
  },
});

export const rootBotProjectIdSelector = selector({
  key: 'rootBotProjectIdSelector',
  get: ({ get }) => {
    const projectIds = get(botProjectIdsState);
    const rootBotId = projectIds[0];
    const botProjectFile = get(botProjectFileState(rootBotId));

    const metaData = get(projectMetaDataState(rootBotId));
    if (metaData.isRootBot && !isEmpty(botProjectFile)) {
      return rootBotId;
    }
  },
});

export const jsonSchemaFilesByProjectIdSelector = selector({
  key: 'jsonSchemaFilesByProjectIdSelector',
  get: ({ get }) => {
    const projectIds = get(botProjectIdsState);
    const result: Record<string, JsonSchemaFile[]> = {};
    projectIds.forEach((projectId) => {
      result[projectId] = get(jsonSchemaFilesState(projectId));
    });
    return result;
  },
});

export const perProjectDiagnosticsSelectorFamily = selectorFamily({
  key: 'perProjectDiagnosticsSelectorFamily',
  get: (projectId: string) => ({ get }) => {
    const { isRemote, isRootBot } = get(projectMetaDataState(projectId));
    const rootBotId = get(rootBotProjectIdSelector) || projectId;
    const rootSetting = get(settingsState(rootBotId));
    const dialogs = get(dialogsWithLuProviderSelectorFamily(projectId));
    const formDialogSchemas = get(formDialogSchemasSelectorFamily(projectId));
    const luFiles = get(luFilesSelectorFamily(projectId));
    const lgFiles = get(lgFilesSelectorFamily(projectId));
    const setting = get(settingsState(projectId));
    const skillManifests = get(skillManifestsState(projectId));
    const dialogSchemas = get(dialogSchemasState(projectId));
    const qnaFiles = get(qnaFilesSelectorFamily(projectId));
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
      recognizers: [],
      crossTrainConfig: {},
    };
    return BotIndexer.validate({ ...botAssets, isRemote, isRootBot }, rootSetting);
  },
});

export const botProjectDiagnosticsSelector = selector({
  key: 'botProjectDiagnosticsSelector',
  get: ({ get }) => {
    const botProjects = get(botProjectIdsState);
    const result = botProjects.map((projectId: string) => {
      return get(perProjectDiagnosticsSelectorFamily(projectId));
    });
    return result;
  },
});

export const projectDialogsMapSelector = selector<{ [key: string]: DialogInfo[] }>({
  key: 'projectDialogsMap',
  get: ({ get }) => {
    const projectIds = get(botProjectIdsState);

    return projectIds.reduce((result, projectId) => {
      const dialogIds = get(dialogIdsState(projectId));
      result[projectId] = dialogIds.map((dialogId) => {
        return get(dialogState({ projectId, dialogId }));
      });
      return result;
    }, {});
  },
});

export const projectTreeSelectorFamily = selector<TreeDataPerProject[]>({
  key: 'projectTreeSelectorFamily',
  get: ({ get }) => {
    const projectIds = get(botProjectIdsState);
    return projectIds.map((projectId: string) => {
      const { isRemote, isRootBot } = get(projectMetaDataState(projectId));
      const dialogs = get(dialogsSelectorFamily(projectId));
      const sortedDialogs = [...dialogs].sort((x, y) => {
        if (x.isRoot) {
          return -1;
        } else if (y.isRoot) {
          return 1;
        } else {
          return 0;
        }
      });

      const botError = get(botErrorState(projectId));
      const name = get(botDisplayNameState(projectId));
      const dialogIds = get(dialogIdsState(projectId));

      const lgImports: Record<string, LanguageFileImport[]> = {};
      const luImports: Record<string, LanguageFileImport[]> = {};

      // flatten imported file list
      let lgImportsList: LanguageFileImport[] = [];
      let luImportsList: LanguageFileImport[] = [];

      dialogs.forEach((d) => {
        const currentLgImports = get(lgImportsSelectorFamily({ projectId, dialogId: d.id })) ?? [];
        lgImports[d.id] = currentLgImports;
        if (!d.isFormDialog) {
          lgImportsList.push(...currentLgImports);
        }

        const currentLuImports = get(luImportsSelectorFamily({ projectId, dialogId: d.id })) ?? [];
        luImports[d.id] = currentLuImports;
        if (!d.isFormDialog) {
          luImportsList.push(...currentLuImports);
        }
      });

      const schemas = get(schemasState(projectId));
      const isPvaSchema = schemas && checkForPVASchema(schemas.sdk);
      const formDialogSchemas = get(formDialogSchemasSelectorFamily(projectId));

      lgImportsList = uniqBy(lgImportsList, 'id').filter((item) => !dialogIds.includes(item.displayName) && item.id);
      luImportsList = uniqBy(luImportsList, 'id').filter((item) => !dialogIds.includes(item.displayName) && item.id);

      return {
        projectId,
        isRemote,
        isRootBot,
        sortedDialogs,
        luImports,
        lgImports,
        lgImportsList,
        luImportsList,
        name,
        isPvaSchema,
        formDialogSchemas,
        botError,
      };
    });
  },
});

export const webChatEssentialsSelector = selectorFamily<WebChatEssentials, string>({
  key: 'webChatEssentialsSelector',
  get: (projectId: string) => ({ get }) => {
    const settings = get(settingsState(projectId));
    const secrets = {
      msAppId: settings.MicrosoftAppId || '',
      msPassword: settings.MicrosoftAppPassword || '',
    };
    const botEndpoints = get(botEndpointsState);
    const botUrl = botEndpoints[projectId];
    const botName = get(botDisplayNameState(projectId));
    const activeLocale = get(localeState(projectId));
    const botStatus = get(botStatusState(projectId));

    return {
      projectId,
      botName,
      secrets,
      botUrl,
      activeLocale,
      botStatus,
    };
  },
});

export const allRequiredRecognizersSelector = selector({
  key: 'allRequiredRecognizersSelector',
  get: ({ get }) => {
    const ids = get(botProjectIdsState);
    return ids.reduce((result: { projectId: string; requiresLUIS: boolean; requiresQNA: boolean }[], id: string) => {
      const botAssets = get(botAssetsSelectFamily(id));
      if (botAssets) {
        const { dialogs, luFiles, qnaFiles } = botAssets;
        const requiresLUIS = BotIndexer.shouldUseLuis(dialogs, luFiles);
        const requiresQNA = BotIndexer.shouldUseQnA(dialogs, qnaFiles);
        result.push({ projectId: id, requiresLUIS, requiresQNA });
      }
      return result;
    }, []);
  },
});

export const outputsDebugPanelSelector = selector<WebChatEssentials[]>({
  key: 'outputsDebugPanelSelector',
  get: ({ get }) => {
    const projectIds: string[] = get(botProjectIdsState);
    return projectIds.map((projectId) => {
      return get(webChatEssentialsSelector(projectId));
    });
  },
});
