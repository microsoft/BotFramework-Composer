// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotIndexer } from '@bfc/indexers';
import { BotAssets, FormDialogSchema, JsonSchemaFile } from '@bfc/shared';
import isEmpty from 'lodash/isEmpty';
import { selector, selectorFamily } from 'recoil';

import settingStorage from '../../utils/dialogSettingStorage';
import {
  botDisplayNameState,
  botErrorState,
  botNameIdentifierState,
  botProjectFileState,
  botProjectIdsState,
  formDialogSchemaIdsState,
  formDialogSchemaState,
  settingsState,
  luFilesState,
  lgFilesState,
  qnaFilesState,
  skillManifestsState,
  dialogSchemasState,
  jsonSchemaFilesState,
  projectMetaDataState,
} from '../atoms';
import { dialogsSelectorFamily } from '../selectors';

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

export const localBotsDataSelector = selector({
  key: 'localBotsDataSelector',
  get: ({ get }) => {
    const botProjectIds = get(localBotsWithoutErrorsSelector);
    return botProjectIds.map((projectId: string) => {
      return {
        projectId,
        name: get(botDisplayNameState(projectId)),
      };
    });
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
      const dialogs = get(dialogsSelectorFamily(projectId));
      const formDialogSchemas = get(formDialogSchemasSelectorFamily(projectId));
      const metaData = get(projectMetaDataState(projectId));
      const botError = get(botErrorState(projectId));
      const name = get(botDisplayNameState(projectId));
      const botNameId = get(botNameIdentifierState(projectId));

      const luFiles = get(luFilesState(projectId));
      const lgFiles = get(lgFilesState(projectId));
      const setting = get(settingsState(projectId));
      const skillManifests = get(skillManifestsState(projectId));
      const dialogSchemas = get(dialogSchemasState(projectId));
      const qnaFiles = get(qnaFilesState(projectId));
      const botProjectFile = get(botProjectFileState(projectId));
      const jsonSchemaFiles = get(jsonSchemaFilesState(projectId));
      const localeSetting = settingStorage.get(projectId);
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
      const diagnostics = BotIndexer.validate(botAssets, localeSetting);

      return { dialogs, formDialogSchemas, projectId, name, ...metaData, error: botError, diagnostics, botNameId };
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

export const skillsProjectIdSelector = selector({
  key: 'skillsProjectIdSelector',
  get: ({ get }) => {
    const botIds = get(botProjectIdsState);
    return botIds.filter((projectId: string) => {
      const { isRootBot } = get(projectMetaDataState(projectId));
      return !isRootBot;
    });
  },
});

export const botProjectDiagnosticsSelector = selector({
  key: 'botProjectDiagnosticsSelector',
  get: ({ get }) => {
    const botProjects = get(botProjectIdsState);
    const result = botProjects.map((projectId: string) => {
      const dialogs = get(dialogsSelectorFamily(projectId));
      const formDialogSchemas = get(formDialogSchemasSelectorFamily(projectId));
      const luFiles = get(luFilesState(projectId));
      const lgFiles = get(lgFilesState(projectId));
      const setting = get(settingsState(projectId));
      const skillManifests = get(skillManifestsState(projectId));
      const dialogSchemas = get(dialogSchemasState(projectId));
      const qnaFiles = get(qnaFilesState(projectId));
      const botProjectFile = get(botProjectFileState(projectId));
      const jsonSchemaFiles = get(jsonSchemaFilesState(projectId));
      const localeSetting = settingStorage.get(projectId);
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
      return BotIndexer.validate(botAssets, localeSetting);
    });
    return result;
  },
});
