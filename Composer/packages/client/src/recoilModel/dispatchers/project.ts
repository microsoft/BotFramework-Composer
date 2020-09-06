/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { useRecoilCallback, CallbackInterface } from 'recoil';
import {
  dereferenceDefinitions,
  LuFile,
  QnAFile,
  DialogInfo,
  SensitiveProperties,
  DialogSetting,
  convertSkillsToDictionary,
} from '@bfc/shared';
import { indexer, validateDialog } from '@bfc/indexers';
import objectGet from 'lodash/get';
import objectSet from 'lodash/set';
import isArray from 'lodash/isArray';
import formatMessage from 'format-message';

import lgWorker from '../parsers/lgWorker';
import luWorker from '../parsers/luWorker';
import qnaWorker from '../parsers/qnaWorker';
import httpClient from '../../utils/httpUtil';
import { BotStatus } from '../../constants';
import { getReferredLuFiles } from '../../utils/luUtil';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import { getReferredQnaFiles } from '../../utils/qnaUtil';
import qnaFileStatusStorage from '../../utils/qnaFileStatusStorage';
import settingStorage from '../../utils/dialogSettingStorage';
import filePersistence from '../persistence/FilePersistence';
import { navigateTo } from '../../utils/navigation';
import languageStorage from '../../utils/languageStorage';
import { projectIdCache } from '../../utils/projectCache';
import { designPageLocationState } from '../atoms/botState';
import { QnABotTemplateId } from '../../constants';

import {
  skillManifestsState,
  BotDiagnosticsState,
  settingsState,
  localeState,
  luFilesState,
  qnaFilesState,
  skillsState,
  schemasState,
  lgFilesState,
  locationState,
  botStatusState,
  botNameState,
  botEnvironmentState,
  dialogsState,
  projectIdState,
  botOpeningState,
  recentProjectsState,
  templateProjectsState,
  runtimeTemplatesState,
  applicationErrorState,
  templateIdState,
  announcementState,
  boilerplateVersionState,
  dialogSchemasState,
} from './../atoms';
import { logMessage, setError } from './../dispatchers/shared';

const handleProjectFailure = (callbackHelpers: CallbackInterface, ex) => {
  callbackHelpers.set(botOpeningState, false);
  setError(callbackHelpers, ex);
};

const checkProjectUpdates = async () => {
  const workers = [filePersistence, lgWorker, luWorker, qnaWorker];

  return Promise.all(workers.map((w) => w.flush()));
};

const processSchema = (projectId: string, schema: any) => ({
  ...schema,
  definitions: dereferenceDefinitions(schema.definitions),
});

// if user set value in terminal or appsetting.json, it should update the value in localStorage
const refreshLocalStorage = (projectId: string, settings: DialogSetting) => {
  for (const property of SensitiveProperties) {
    const value = objectGet(settings, property);
    if (value) {
      settingStorage.setField(projectId, property, value);
    }
  }
};

// merge sensitive values in localStorage
const mergeLocalStorage = (projectId: string, settings: DialogSetting) => {
  const localSetting = settingStorage.get(projectId);
  const mergedSettings = { ...settings };
  if (localSetting) {
    for (const property of SensitiveProperties) {
      const value = objectGet(localSetting, property);
      if (value) {
        objectSet(mergedSettings, property, value);
      } else {
        objectSet(mergedSettings, property, ''); // set those key back, because that were omit after persisited
      }
    }
  }
  return mergedSettings;
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
    getReferredLuFiles(luFiles, dialogs).map((file) => file.id)
  );
  return updateLuFilesStatus(projectId, luFiles);
};

const updateQnaFilesStatus = (projectId: string, qnaFiles: QnAFile[]) => {
  const status = qnaFileStatusStorage.get(projectId);
  return qnaFiles.map((qnaFile) => {
    if (typeof status[qnaFile.id] === 'boolean') {
      return { ...qnaFile, published: status[qnaFile.id] };
    } else {
      return { ...qnaFile, published: false };
    }
  });
};

const initQnaFilesStatus = (projectId: string, qnaFiles: QnAFile[], dialogs: DialogInfo[]) => {
  qnaFileStatusStorage.checkFileStatus(
    projectId,
    getReferredQnaFiles(qnaFiles, dialogs).map((file) => file.id)
  );
  return updateQnaFilesStatus(projectId, qnaFiles);
};
export const projectDispatcher = () => {
  const initBotState = async (callbackHelpers: CallbackInterface, data: any, jump: boolean, templateId: string) => {
    const { snapshot, gotoSnapshot } = callbackHelpers;
    const curLocation = await snapshot.getPromise(locationState);
    const { files, botName, botEnvironment, location, schemas, settings, id: projectId, diagnostics, skills } = data;
    const storedLocale = languageStorage.get(botName)?.locale;
    const locale = settings.languages.includes(storedLocale) ? storedLocale : settings.defaultLanguage;

    // cache current projectId in session, resolve page refresh caused state lost.
    projectIdCache.set(projectId);

    try {
      schemas.sdk.content = processSchema(projectId, schemas.sdk.content);
    } catch (err) {
      const diagnostics = schemas.diagnostics ?? [];
      diagnostics.push(err.message);
      schemas.diagnostics = diagnostics;
    }

    try {
      const { dialogs, dialogSchemas, luFiles, lgFiles, qnaFiles, skillManifestFiles } = indexer.index(
        files,
        botName,
        locale
      );

      let mainDialog = '';
      const verifiedDialogs = dialogs.map((dialog) => {
        if (dialog.isRoot) {
          mainDialog = dialog.id;
        }
        dialog.diagnostics = validateDialog(dialog, schemas.sdk.content, lgFiles, luFiles);
        return dialog;
      });

      await lgWorker.addProject(projectId, lgFiles);

      // Important: gotoSnapshot will wipe all states.
      const newSnapshot = snapshot.map(({ set }) => {
        set(skillManifestsState, skillManifestFiles);
        set(luFilesState, initLuFilesStatus(botName, luFiles, dialogs));
        set(qnaFilesState, initQnaFilesStatus(botName, qnaFiles, dialogs));
        set(lgFilesState, lgFiles);
        set(dialogsState, verifiedDialogs);
        set(dialogSchemasState, dialogSchemas);
        set(botEnvironmentState, botEnvironment);
        set(botNameState, botName);
        if (location !== curLocation) {
          set(botStatusState, BotStatus.unConnected);
          set(locationState, location);
        }
        set(skillsState, skills);
        set(schemasState, schemas);
        set(localeState, locale);
        set(BotDiagnosticsState, diagnostics);
        set(botOpeningState, false);
        set(projectIdState, projectId);
        refreshLocalStorage(projectId, settings);
        const mergedSettings = mergeLocalStorage(projectId, settings);
        if (isArray(mergedSettings.skill)) {
          mergedSettings.skill = convertSkillsToDictionary(mergedSettings.skill);
        }
        set(settingsState, mergedSettings);
      });
      gotoSnapshot(newSnapshot);
      if (jump && projectId) {
        let url = `/bot/${projectId}/dialogs/${mainDialog}`;
        if (templateId === QnABotTemplateId) {
          url = `/bot/${projectId}/knowledge-base/${mainDialog}`;
        }
        navigateTo(url);
      }
    } catch (err) {
      callbackHelpers.set(botOpeningState, false);
      setError(callbackHelpers, err);
      navigateTo('/home');
    }
  };

  const removeRecentProject = async (callbackHelpers: CallbackInterface, path: string) => {
    try {
      const {
        set,
        snapshot: { getPromise },
      } = callbackHelpers;
      const currentRecentProjects = await getPromise(recentProjectsState);
      const filtered = currentRecentProjects.filter((p) => p.path !== path);
      set(recentProjectsState, filtered);
    } catch (ex) {
      logMessage(callbackHelpers, `Error removing recent project: ${ex}`);
    }
  };

  const setBotOpeningStatus = async (callbackHelpers: CallbackInterface) => {
    const { set } = callbackHelpers;
    set(botOpeningState, true);
    await checkProjectUpdates();
  };

  const openBotProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (path: string, storageId = 'default') => {
      try {
        await setBotOpeningStatus(callbackHelpers);
        const response = await httpClient.put(`/projects/open`, { path, storageId });
        await initBotState(callbackHelpers, response.data, true, '');

        return response.data.id;
      } catch (ex) {
        removeRecentProject(callbackHelpers, path);
        handleProjectFailure(callbackHelpers, ex);
      }
    }
  );

  const fetchProjectById = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    try {
      const response = await httpClient.get(`/projects/${projectId}`);
      await initBotState(callbackHelpers, response.data, false, '');
    } catch (ex) {
      handleProjectFailure(callbackHelpers, ex);
      navigateTo('/home');
    }
  });

  const createProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (
      templateId: string,
      name: string,
      description: string,
      location: string,
      schemaUrl?: string
    ) => {
      try {
        await setBotOpeningStatus(callbackHelpers);
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
        await initBotState(callbackHelpers, response.data, true, templateId);
        return projectId;
      } catch (ex) {
        handleProjectFailure(callbackHelpers, ex);
      }
    }
  );

  const deleteBotProject = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    const { reset } = callbackHelpers;
    try {
      await httpClient.delete(`/projects/${projectId}`);
      luFileStatusStorage.removeAllStatuses(projectId);
      qnaFileStatusStorage.removeAllStatuses(projectId);
      settingStorage.remove(projectId);
      projectIdCache.clear();
      reset(projectIdState);
      reset(dialogsState);
      reset(botEnvironmentState);
      reset(botNameState);
      reset(botStatusState);
      reset(locationState);
      reset(lgFilesState);
      reset(skillsState);
      reset(schemasState);
      reset(luFilesState);
      reset(settingsState);
      reset(localeState);
      reset(skillManifestsState);
      reset(designPageLocationState);
    } catch (e) {
      logMessage(callbackHelpers, e.message);
    }
  });

  const saveProjectAs = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (projectId, name, description, location) => {
      try {
        await setBotOpeningStatus(callbackHelpers);
        const response = await httpClient.post(`/projects/${projectId}/project/saveAs`, {
          storageId: 'default',
          name,
          description,
          location,
        });
        await initBotState(callbackHelpers, response.data, true, '');
        return response.data.id;
      } catch (ex) {
        handleProjectFailure(callbackHelpers, ex);
        logMessage(callbackHelpers, ex.message);
      }
    }
  );

  const fetchRecentProjects = useRecoilCallback((callbackHelpers: CallbackInterface) => async () => {
    const { set } = callbackHelpers;
    try {
      const response = await httpClient.get(`/projects/recent`);
      set(recentProjectsState, response.data);
    } catch (ex) {
      set(recentProjectsState, []);
      logMessage(callbackHelpers, `Error in fetching recent projects: ${ex}`);
    }
  });

  const fetchRuntimeTemplates = useRecoilCallback<[], Promise<void>>(
    (callbackHelpers: CallbackInterface) => async () => {
      const { set } = callbackHelpers;
      try {
        const response = await httpClient.get(`/runtime/templates`);
        if (isArray(response.data)) {
          set(runtimeTemplatesState, [...response.data]);
        }
      } catch (ex) {
        // TODO: Handle exceptions
        logMessage(callbackHelpers, `Error fetching runtime templates: ${ex}`);
      }
    }
  );

  const fetchTemplates = useRecoilCallback<[], Promise<void>>((callbackHelpers: CallbackInterface) => async () => {
    try {
      const response = await httpClient.get(`/assets/projectTemplates`);

      const data = response && response.data;

      if (data && Array.isArray(data) && data.length > 0) {
        callbackHelpers.set(templateProjectsState, data);
      }
    } catch (err) {
      // TODO: Handle exceptions
      logMessage(callbackHelpers, `Error fetching runtime templates: ${err}`);
    }
  });

  const setBotStatus = useRecoilCallback<[BotStatus], Promise<void>>(
    ({ set }: CallbackInterface) => async (status: BotStatus) => {
      set(botStatusState, status);
    }
  );

  const createFolder = useRecoilCallback<[string, string], Promise<void>>(
    ({ set }: CallbackInterface) => async (path, name) => {
      const storageId = 'default';
      try {
        await httpClient.post(`/storages/folder`, { path, name, storageId });
      } catch (err) {
        set(applicationErrorState, {
          message: err.message,
          summary: formatMessage('Create Folder Error'),
        });
      }
    }
  );

  const updateFolder = useRecoilCallback<[string, string, string], Promise<void>>(
    ({ set }: CallbackInterface) => async (path, oldName, newName) => {
      const storageId = 'default';
      try {
        await httpClient.put(`/storages/folder`, { path, oldName, newName, storageId });
      } catch (err) {
        set(applicationErrorState, {
          message: err.message,
          summary: formatMessage('Update Folder Name Error'),
        });
      }
    }
  );

  const saveTemplateId = useRecoilCallback<[string], void>(({ set }: CallbackInterface) => (templateId) => {
    if (templateId) {
      set(templateIdState, templateId);
    }
  });

  const updateBoilerplate = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    try {
      await httpClient.post(`/projects/${projectId}/updateBoilerplate`);
      callbackHelpers.set(announcementState, formatMessage('Scripts successfully updated.'));
    } catch (ex) {
      setError(callbackHelpers, ex);
    }
  });

  const getBoilerplateVersion = useRecoilCallback((callbackHelpers: CallbackInterface) => async (projectId: string) => {
    try {
      const response = await httpClient.get(`/projects/${projectId}/boilerplateVersion`);
      const { updateRequired, latestVersion, currentVersion } = response.data;
      callbackHelpers.set(boilerplateVersionState, { updateRequired, latestVersion, currentVersion });
    } catch (ex) {
      setError(callbackHelpers, ex);
    }
  });

  return {
    openBotProject,
    createProject,
    deleteBotProject,
    saveProjectAs,
    fetchTemplates,
    fetchProjectById,
    fetchRecentProjects,
    fetchRuntimeTemplates,
    setBotStatus,
    updateFolder,
    createFolder,
    saveTemplateId,
    updateBoilerplate,
    getBoilerplateVersion,
  };
};
