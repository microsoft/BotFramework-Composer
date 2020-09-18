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
  botOpeningState,
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
import {
  fetchProjectDataByPath,
  fetchProjectDataById,
  flushExistingTasks,
  getMergedSettings,
  navigateToBot,
  parseSkillPaths,
} from './utils/project';

const handleProjectFailure = (callbackHelpers: CallbackInterface, ex) => {
  callbackHelpers.set(botOpeningState, false);
  setError(callbackHelpers, ex);
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
  const initBotState = async (callbackHelpers, data: any, botFiles, isRootBot = false) => {
    const { snapshot, set } = callbackHelpers;
    const { botName, botEnvironment, location, schemas, settings, id: projectId, diagnostics } = data;
    const { dialogs, dialogSchemas, luFiles, lgFiles, qnaFiles, skillManifestFiles, skills, mergedSettings } = botFiles;
    const curLocation = await snapshot.getPromise(locationState(projectId));
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
      set(projectMetaDataState(projectId), {
        isRootBot,
      });
      return mainDialog;
    } catch (err) {
      callbackHelpers.set(botOpeningState, false);
      setError(callbackHelpers, err);
      navigateTo('/home');
      return '';
    }
  };

  const openSkill = async (callbackHelpers, skill: { path: string; remote: boolean }, storageId) => {
    const { set } = callbackHelpers;
    try {
      if (!skill.remote) {
        const { projectData, botFiles } = await fetchProjectDataByPath(skill.path, storageId);
        await initBotState(callbackHelpers, projectData, botFiles);
        set(botProjectsSpaceState, (current) => [...current, projectData.projectId]);
      }
    } catch (ex) {
      // Handle exception in opening a skill
    }
  };

  const openProject = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (path: string, storageId = 'default') => {
      try {
        const { set } = callbackHelpers;
        await flushExistingTasks(callbackHelpers);
        const { projectData, botFiles } = await fetchProjectDataByPath(path, storageId);
        const mainDialog = await initBotState(callbackHelpers, projectData, botFiles, true);
        set(botProjectsSpaceState, []);
        if (botFiles.botProjectSpaceFiles.length) {
          // Handle botproject space code here. CUrrently always fetching the first BotProject file received. In future, there would be a file for each environment
          const skillsInBotProject = parseSkillPaths(botFiles.botProjectSpaceFiles[0]);
          skillsInBotProject.forEach((skillInBotProject) => {
            openSkill(callbackHelpers, skillInBotProject, storageId);
          });
        }
        //TODO: Botprojects space will be populated for now with just the rootbot. Once, BotProjects UI is hookedup this will be refactored to use addToBotProject
        set(botProjectsSpaceState, [projectData.projectId]);
        set(currentProjectIdState, projectData.projectId);
        navigateToBot(projectData.projectId, mainDialog);
      } catch (ex) {
        removeRecentProject(callbackHelpers, path);
        handleProjectFailure(callbackHelpers, ex);
      }
    }
  );

  return {
    openProject,
  };
};
