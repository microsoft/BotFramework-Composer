// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotIndexer } from '@bfc/indexers';
import { BotAssets, checkForPVASchema, DialogInfo, FormDialogSchema, JsonSchemaFile } from '@bfc/shared';
import isEmpty from 'lodash/isEmpty';
import { selector, selectorFamily } from 'recoil';

import {
  botDisplayNameState,
  botErrorState,
  botNameIdentifierState,
  botProjectFileState,
  botProjectIdsState,
  formDialogSchemaIdsState,
  formDialogSchemaState,
  luFilesState,
  lgFilesState,
  qnaFilesState,
  skillManifestsState,
  dialogSchemasState,
  jsonSchemaFilesState,
  projectMetaDataState,
  settingsState,
  dialogIdsState,
  dialogState,
  schemasState,
} from '../atoms';
import { dialogsSelectorFamily, buildEssentialsSelector } from '../selectors';

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
    const botProjectsWithoutError = get(botProjectSpaceSelector).filter((b) => botProjectIds.includes(b.projectId));
    return botProjectsWithoutError;
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
      const dialogs = get(dialogsSelectorFamily(projectId));
      const luFiles = get(luFilesState(projectId));
      const lgFiles = get(lgFilesState(projectId));
      const qnaFiles = get(qnaFilesState(projectId));
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

      return {
        dialogs,
        formDialogSchemas,
        projectId,
        name,
        ...metaData,
        setting,
        error: botError,
        diagnostics,
        botNameId,
        buildEssentials,
        isPvaSchema,
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

export const botProjectDiagnosticsSelector = selector({
  key: 'botProjectDiagnosticsSelector',
  get: ({ get }) => {
    const botProjects = get(botProjectIdsState);
    const result = botProjects.map((projectId: string) => {
      const { isRemote, isRootBot } = get(projectMetaDataState(projectId));
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
      return BotIndexer.validate({ ...botAssets, isRemote, isRootBot });
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
