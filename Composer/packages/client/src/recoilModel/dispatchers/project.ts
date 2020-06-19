/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useRecoilCallback, CallbackInterface } from 'recoil';
import { dereferenceDefinitions, LuFile, DialogInfo, SensitiveProperties } from '@bfc/shared';
import { indexer } from '@bfc/indexers';
import get from 'lodash/get';
import set from 'lodash/set';

import filePersistence from '../../store/persistence/FilePersistence';
import lgWorker from '../../store/parsers/lgWorker';
import luWorker from '../../store/parsers/luWorker';
import httpClient from '../../utils/httpUtil';
import { BotStatus } from '../../constants';
import { getReferredFiles } from '../../utils/luUtil';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import { DialogSetting } from '../../store/types';
import settingStorage from '../../utils/dialogSettingStorage';

import { skillManifestsState } from './../atoms/botState';
import { BotDiagnosticsState } from './../atoms/botState';
import { settingsState, localeState } from './../atoms/botState';
import { luFilesState } from './../atoms/botState';
import { skillsState, schemasState } from './../atoms/botState';
import { lgFilesState } from './../atoms/botState';
import { locationState } from './../atoms/botState';
import { botStatusState } from './../atoms/botState';
import { botNameState } from './../atoms/botState';
import { botEnvironmentState } from './../atoms/botState';
import { dialogsState } from './../atoms/botState';
import { projectIdState } from './../atoms/botState';
import { botOpeningState } from './../atoms/botState';

const checkProjectUpdates = async () => {
  const workers = [filePersistence, lgWorker, luWorker];

  return Promise.all(workers.map((w) => w.flush()));
};

const processSchema = (projectId: string, schema: any) => ({
  ...schema,
  definitions: dereferenceDefinitions(schema.definitions),
});

// if user set value in terminal or appsetting.json, it should update the value in localStorage
const refreshLocalStorage = (projectId: string, settings: DialogSetting) => {
  for (const property of SensitiveProperties) {
    const value = get(settings, property);
    if (value) {
      settingStorage.setField(projectId, property, value);
    }
  }
};

// merge sensitive values in localStorage
const mergeLocalStorage = (projectId: string, settings: DialogSetting) => {
  const localSetting = settingStorage.get(projectId);
  if (localSetting) {
    for (const property of SensitiveProperties) {
      const value = get(localSetting, property);
      if (value) {
        set(settings, property, value);
      } else {
        set(settings, property, ''); // set those key back, because that were omit after persisited
      }
    }
  }
};

const updateLuFilesStatus = (projectId: string, luFiles: LuFile[]) => {
  const status = luFileStatusStorage.get(projectId);
  return luFiles.map((luFile) => {
    if (typeof status[luFile.id] === 'boolean') {
      return { ...luFile, published: status[luFile.id] };
    } else {
      return { ...luFile, published: false };
    }
  });
};

const initLuFilesStatus = (projectId: string, luFiles: LuFile[], dialogs: DialogInfo[]) => {
  luFileStatusStorage.checkFileStatus(
    projectId,
    getReferredFiles(luFiles, dialogs).map((file) => file.id)
  );
  return updateLuFilesStatus(projectId, luFiles);
};

export const projectDispatcher = () => {
  const initBotState = async (callbackHelpers: CallbackInterface, data: any) => {
    const { set, snapshot } = callbackHelpers;
    const { files, botName, botEnvironment, location, schemas, settings, id, locale, diagnostics, skills } = data;
    schemas.sdk.content = processSchema(id, schemas.sdk.content);
    const { dialogs, luFiles, lgFiles, skillManifestFiles } = indexer.index(
      files,
      botName,
      schemas.sdk.content,
      locale
    );
    set(projectIdState, id);
    set(dialogsState, dialogs);
    set(botEnvironmentState, botEnvironment);
    set(botNameState, botName);
    const curLocation = await snapshot.getPromise(locationState);
    if (location !== curLocation) {
      set(botStatusState, BotStatus.unConnected);
      set(locationState, location);
    }
    set(lgFilesState, lgFiles);
    set(skillsState, skills);
    set(schemasState, schemas);
    set(luFilesState, initLuFilesStatus(botName, luFiles, dialogs));
    set(settingsState, settings);
    set(localeState, locale);
    set(BotDiagnosticsState, diagnostics);
    set(skillManifestsState, skillManifestFiles);
    set(botOpeningState, false);
    refreshLocalStorage(id, settings);
    mergeLocalStorage(id, settings);
  };

  const setOpenPendingStatusasync = async (callbackHelpers: CallbackInterface) => {
    const { set } = callbackHelpers;
    set(botOpeningState, true);
    await checkProjectUpdates();
  };

  const openBotProject = useRecoilCallback<[string, string], Promise<string>>(
    (callbackHelpers: CallbackInterface) => async (path: string, storageId = 'default') => {
      await setOpenPendingStatusasync(callbackHelpers);
      const response = await httpClient.put(`/projects/open`, { path, storageId });
      await initBotState(callbackHelpers, response.data);
      return response.data.id;
    }
  );

  const fetchProjectById = useRecoilCallback<[string], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async (projectId: string) => {
      const response = await httpClient.get(`/projects/${projectId}`);
      await initBotState(callbackHelpers, response.data);
    }
  );

  const createProject = useRecoilCallback<[string, string, string, string, string], Promise<string>>(
    (callbackHelpers: CallbackInterface) => async (
      templateId: string,
      name: string,
      description: string,
      location: string,
      schemaUrl?: string
    ) => {
      await setOpenPendingStatusasync(callbackHelpers);
      const response = await httpClient.post(`/projects`, {
        storageId: 'default',
        templateId,
        name,
        description,
        location,
        schemaUrl,
      });
      const projectId = response.data.id;
      if (settingStorage.get(projectId)) {
        settingStorage.remove(projectId);
      }
      await initBotState(callbackHelpers, response.data);
      return projectId;
    }
  );

  return {
    openBotProject,
    createProject,
    fetchProjectById,
  };
};
