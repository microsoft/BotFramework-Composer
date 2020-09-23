/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';

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
import queryString from 'query-string';
import { indexer, validateDialog } from '@bfc/indexers';
import objectGet from 'lodash/get';
import objectSet from 'lodash/set';
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
import {
  designPageLocationState,
  botDiagnosticsState,
  botProjectsSpaceState,
  projectMetaDataState,
  filePersistenceState,
  currentProjectIdState,
} from '../atoms';
import { QnABotTemplateId } from '../../constants';
import FilePersistence from '../persistence/FilePersistence';
import UndoHistory from '../undo/undoHistory';
import { undoHistoryState } from '../undo/history';

import {
  skillManifestsState,
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
  const initBotState = async (
    callbackHelpers: CallbackInterface,
    data: any,
    jump: boolean,
    templateId: string,
    qnaKbUrls?: string[]
  ) => {
    const { snapshot, gotoSnapshot, set } = callbackHelpers;
    const {
      files,
      botName,
      botEnvironment,
      location,
      schemas,
      settings,
      id: projectId,
      diagnostics,
      skills: skillContent,
    } = data;
    const curLocation = await snapshot.getPromise(locationState(projectId));
    const storedLocale = languageStorage.get(botName)?.locale;
    const locale = settings.languages.includes(storedLocale) ? storedLocale : settings.defaultLanguage;

    // cache current projectId in session, resolve page refresh caused state lost.
    projectIdCache.set(projectId);

    const mergedSettings = mergeLocalStorage(projectId, settings);
    if (Array.isArray(mergedSettings.skill)) {
      const skillsArr = mergedSettings.skill.map((skillData) => ({ ...skillData }));
      mergedSettings.skill = convertSkillsToDictionary(skillsArr);
    }

    try {
      schemas.sdk.content = processSchema(projectId, schemas.sdk.content);
    } catch (err) {
      const diagnostics = schemas.diagnostics ?? [];
      diagnostics.push(err.message);
      schemas.diagnostics = diagnostics;
    }

    try {
      const { dialogs, dialogSchemas, luFiles, lgFiles, qnaFiles, skillManifestFiles, skills } = indexer.index(
        files,
        botName,
        locale,
        skillContent,
        mergedSettings
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
      set(botProjectsSpaceState, []);

      // Important: gotoSnapshot will wipe all states.
      const newSnapshot = snapshot.map(({ set }) => {
        set(skillManifestsState(projectId), skillManifestFiles);
        set(luFilesState(projectId), initLuFilesStatus(botName, luFiles, dialogs));
        set(lgFilesState(projectId), lgFiles);
        set(dialogsState(projectId), verifiedDialogs);
        set(dialogSchemasState(projectId), dialogSchemas);
        set(botEnvironmentState(projectId), botEnvironment);
        set(botNameState(projectId), botName);
        set(qnaFilesState(projectId), initQnaFilesStatus(botName, qnaFiles, dialogs));
        if (location !== curLocation) {
          set(botStatusState(projectId), BotStatus.unConnected);
          set(locationState(projectId), location);
        }
        set(skillsState(projectId), skills);
        set(schemasState(projectId), schemas);
        set(localeState(projectId), locale);
        set(botDiagnosticsState(projectId), diagnostics);

        refreshLocalStorage(projectId, settings);
        set(settingsState(projectId), mergedSettings);
        set(filePersistenceState(projectId), new FilePersistence(projectId));
        set(undoHistoryState(projectId), new UndoHistory(projectId));
        //TODO: Botprojects space will be populated for now with just the rootbot. Once, BotProjects UI is hookedup this will be refactored to use addToBotProject
        set(botProjectsSpaceState, (current) => [...current, projectId]);
        set(projectMetaDataState(projectId), {
          isRootBot: true,
        });
        set(botOpeningState, false);
      });

      gotoSnapshot(newSnapshot);

      if (jump && projectId) {
        // TODO: Refactor to set it always on init to the root bot
        set(currentProjectIdState, projectId);
        let url = `/bot/${projectId}/dialogs/${mainDialog}`;
        if (templateId === QnABotTemplateId) {
          url = `/bot/${projectId}/knowledge-base/${mainDialog}`;
          navigateTo(url, { state: { qnaKbUrls } });
          return;
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
    const { set, snapshot } = callbackHelpers;
    set(botOpeningState, true);
    const botProjectSpace = await snapshot.getPromise(botProjectsSpaceState);
    const filePersistenceHandlers: filePersistence[] = [];
    for (const projectId of botProjectSpace) {
      const fp = await snapshot.getPromise(filePersistenceState(projectId));
      filePersistenceHandlers.push(fp);
    }
    const workers = [lgWorker, luWorker, qnaWorker, ...filePersistenceHandlers];
    return Promise.all(workers.map((w) => w.flush()));
  };

  const openProject = useRecoilCallback(
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
      schemaUrl?: string,
      locale?: string,
      qnaKbUrls?: string[]
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
          locale,
        });
        const projectId = response.data.id;
        if (settingStorage.get(projectId)) {
          settingStorage.remove(projectId);
        }
        await initBotState(callbackHelpers, response.data, true, templateId, qnaKbUrls);
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
      reset(dialogsState(projectId));
      reset(botEnvironmentState(projectId));
      reset(botNameState(projectId));
      reset(botStatusState(projectId));
      reset(locationState(projectId));
      reset(lgFilesState(projectId));
      reset(skillsState(projectId));
      reset(schemasState(projectId));
      reset(luFilesState(projectId));
      reset(settingsState(projectId));
      reset(localeState(projectId));
      reset(skillManifestsState(projectId));
      reset(designPageLocationState(projectId));
      reset(filePersistenceState(projectId));
      reset(undoHistoryState(projectId));
      reset(botProjectsSpaceState);
      reset(currentProjectIdState);
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
        if (Array.isArray(response.data)) {
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

  const setBotStatus = useRecoilCallback<[BotStatus, string], void>(
    ({ set }: CallbackInterface) => (status: BotStatus, projectId: string) => {
      set(botStatusState(projectId), status);
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

  const checkIfBotProject = async (path: string, storageId): Promise<{ isBotProjectSpace: boolean; contents: any }> => {
    try {
      const qs: any = {
        path,
        storageId,
      };
      const stringified = queryString.stringify(qs, {
        encode: true,
      });
      const response = await httpClient.get(`/projects/checkIfBotProjectSpace?${stringified}`);
      return response.data;
    } catch (ex) {
      return {
        isBotProjectSpace: false,
        contents: undefined,
      };
    }
  };

  const handleBotProjectSpace = async (
    callbackHelpers: CallbackInterface,
    rootBotPath: string,
    storageId,
    botProjectFileContents: any
  ) => {
    const rootBotPromise = httpClient.put(`/projects/open`, { path: rootBotPath, storageId });
    const promises = [rootBotPromise];
    for (const skill of botProjectFileContents.skills) {
      if (skill.workspace) {
        const { protocol } = new URL(skill.workspace);
        if (protocol === 'file:') {
          const relativeSkillPath = skill.workspace.replace('file://', '');
          let skillPath = path.resolve(rootBotPath, relativeSkillPath);
          if (skillPath.match(/^(\/||\\)[A-Z]:/)) {
            // if the path comes out like "/C:/Users", remove the leading slash or backslash
            skillPath = skillPath.slice(1);
          }
          promises.push(httpClient.put(`/projects/open`, { path: path.normalize(skillPath), storageId }));
        }
      } else {
        //Handle remote skill
      }
    }
    const responses = await Promise.all(promises);
    const projectIds: string[] = [];

    let rootBotData = {
      projectId: '',
      mainDialog: '',
    };

    const botDataCollection: any[] = [];
    for (const projectData of responses) {
      const projectId = projectData.data.id;
      projectIds.push(projectId);

      const botData = await initBotProjectSpaceState(callbackHelpers, projectData.data, projectIds.length === 1);

      botDataCollection.push(botData);
    }
    // Important: gotoSnapshot will wipe all states.
    const { snapshot, gotoSnapshot } = callbackHelpers;
    const newSnapshot = snapshot.map(({ set }) => {
      botDataCollection.map((projectData, index) => {
        const projectId = projectIds[index];
        const {
          skillManifestFiles,
          botName,
          luFiles,
          dialogs,
          lgFiles,
          verifiedDialogs,
          dialogSchemas,
          botEnvironment,
          qnaFiles,
          curLocation,
          location,
          skills,
          schemas,
          diagnostics,
          mainDialog,
          locale,
          isRootBot,
          settings,
        } = projectData;

        if (index === 0) {
          rootBotData = {
            projectId,
            mainDialog,
          };
        }

        set(skillManifestsState(projectId), skillManifestFiles);
        set(luFilesState(projectId), initLuFilesStatus(botName, luFiles, dialogs));
        set(lgFilesState(projectId), lgFiles);
        set(dialogsState(projectId), verifiedDialogs);
        set(dialogSchemasState(projectId), dialogSchemas);
        set(botEnvironmentState(projectId), botEnvironment);
        set(botNameState(projectId), botName);
        set(qnaFilesState(projectId), initQnaFilesStatus(botName, qnaFiles, dialogs));
        if (location !== curLocation) {
          set(botStatusState(projectId), BotStatus.unConnected);
          set(locationState(projectId), location);
        }
        set(skillsState(projectId), skills);
        set(schemasState(projectId), schemas);
        set(localeState(projectId), locale);
        set(botDiagnosticsState(projectId), diagnostics);

        refreshLocalStorage(projectId, settings);
        const mergedSettings = mergeLocalStorage(projectId, settings);
        set(settingsState(projectId), mergedSettings);
        set(filePersistenceState(projectId), new FilePersistence(projectId));
        set(undoHistoryState(projectId), new UndoHistory(projectId));
        set(projectMetaDataState(projectId), {
          isRootBot,
        });
      });
      set(botProjectsSpaceState, [...projectIds]);
    });
    gotoSnapshot(newSnapshot);

    if (rootBotData.projectId) {
      const url = `/bot/${rootBotData.projectId}/dialogs/${rootBotData.mainDialog}`;
      navigateTo(url);
    }
  };

  const initBotProjectSpaceState = async (callbackHelpers: CallbackInterface, data: any, isRootBot = false) => {
    const { snapshot } = callbackHelpers;
    const { files, botName, botEnvironment, location, schemas, settings, id: projectId, diagnostics, skills } = data;
    const curLocation = await snapshot.getPromise(locationState(projectId));
    const storedLocale = languageStorage.get(botName)?.locale;
    const locale = settings.languages.includes(storedLocale) ? storedLocale : settings.defaultLanguage;

    // cache current projectId in session, resolve page refresh caused state lost.
    if (isRootBot) {
      projectIdCache.set(projectId);
    }

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

      return {
        skillManifestFiles,
        botName,
        luFiles,
        dialogs,
        lgFiles,
        verifiedDialogs,
        dialogSchemas,
        botEnvironment,
        qnaFiles,
        curLocation,
        location,
        skills,
        schemas,
        diagnostics,
        mainDialog,
        settings,
        locale,
        isRootBot,
      };
    } catch (err) {
      setError(callbackHelpers, err);
      navigateTo('/home');
      return '';
    }
  };

  return {
    openProject,
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
