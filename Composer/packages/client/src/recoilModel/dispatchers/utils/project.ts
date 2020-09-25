// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import path from 'path';

import { v4 as uuid } from 'uuid';
import {
  SensitiveProperties,
  convertSkillsToDictionary,
  DialogSetting,
  dereferenceDefinitions,
  DialogInfo,
  LuFile,
  BotProjectSpace,
  QnAFile,
} from '@bfc/shared';
import objectGet from 'lodash/get';
import objectSet from 'lodash/set';
import { indexer, validateDialog } from '@bfc/indexers';
import { CallbackInterface } from 'recoil';
import { stringify } from 'query-string';

import * as botstates from '../../atoms/botState';
import UndoHistory from '../../undo/undoHistory';
import languageStorage from '../../../utils/languageStorage';
import settingStorage from '../../../utils/dialogSettingStorage';
import {
  botDiagnosticsState,
  botProjectFileState,
  botProjectSpaceLoadedState,
  botProjectIdsState,
  currentProjectIdState,
  filePersistenceState,
  projectMetaDataState,
  qnaFilesState,
  recentProjectsState,
  botOpeningState,
  botErrorState,
} from '../../atoms';
import lgWorker from '../../parsers/lgWorker';
import luWorker from '../../parsers/luWorker';
import qnaWorker from '../../parsers/qnaWorker';
import FilePersistence from '../../persistence/FilePersistence';
import { navigateTo } from '../../../utils/navigation';
import { BotStatus, QnABotTemplateId } from '../../../constants';
import httpClient from '../../../utils/httpUtil';
import { getReferredLuFiles } from '../../../utils/luUtil';
import luFileStatusStorage from '../../../utils/luFileStatusStorage';
import { getReferredQnaFiles } from '../../../utils/qnaUtil';
import qnaFileStatusStorage from '../../../utils/qnaFileStatusStorage';
import { logMessage, setError } from '../shared';
import {
  skillManifestsState,
  settingsState,
  localeState,
  luFilesState,
  skillsState,
  schemasState,
  lgFilesState,
  locationState,
  botStatusState,
  botNameState,
  botEnvironmentState,
  dialogsState,
  dialogSchemasState,
} from '../../atoms';
import { undoHistoryState } from '../../undo/history';

export const resetBotStates = async ({ snapshot, gotoSnapshot }: CallbackInterface, projectId: string) => {
  const botStates = Object.keys(botstates);
  const newSnapshot = snapshot.map(({ reset }) => {
    botStates.forEach((state) => {
      const currentRecoilAtom: any = botstates[state];
      reset(currentRecoilAtom(projectId));
    });
  });
  gotoSnapshot(newSnapshot);
};

export const setErrorOnBotProject = async (
  callbackHelpers: CallbackInterface,
  projectId: string,
  botName: string,
  payload: any
) => {
  const { set } = callbackHelpers;
  if (payload?.response?.data?.message) {
    set(botErrorState(projectId), payload.response.data);
  } else {
    set(botErrorState(projectId), payload);
  }
  if (payload != null) logMessage(callbackHelpers, `Error loading ${botName}: ${JSON.stringify(payload)}`);
};

export const flushExistingTasks = async (callbackHelpers) => {
  const { snapshot, reset } = callbackHelpers;
  const projectIds = await snapshot.getPromise(botProjectIdsState);
  const recoilTasks: any[] = [];
  for (const projectId of projectIds) {
    const resetStates = await resetBotStates(callbackHelpers, projectId);
    recoilTasks.push(resetStates);
  }
  reset(botProjectIdsState);
  const workers = [lgWorker, luWorker, qnaWorker];

  return Promise.all([workers.map((w) => w.flush()), ...recoilTasks]);
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

export const getMergedSettings = (projectId, settings): DialogSetting => {
  const mergedSettings = mergeLocalStorage(projectId, settings);
  if (Array.isArray(mergedSettings.skill)) {
    const skillsArr = mergedSettings.skill.map((skillData) => ({ ...skillData }));
    mergedSettings.skill = convertSkillsToDictionary(skillsArr);
  }
  return mergedSettings;
};

export const navigateToBot = (projectId: string, mainDialog: string, qnaKbUrls?: string[], templateId?: string) => {
  if (projectId) {
    let url = `/bot/${projectId}/dialogs/${mainDialog}`;
    if (templateId === QnABotTemplateId) {
      url = `/bot/${projectId}/knowledge-base/${mainDialog}`;
      navigateTo(url, { state: { qnaKbUrls } });
      return;
    }
    navigateTo(url);
  }
};

const loadProjectData = (response) => {
  const { files, botName, settings, skills: skillContent, id: projectId } = response.data;
  const mergedSettings = getMergedSettings(projectId, settings);
  const storedLocale = languageStorage.get(botName)?.locale;
  const locale = settings.languages.includes(storedLocale) ? storedLocale : settings.defaultLanguage;
  const indexedFiles = indexer.index(files, botName, locale, skillContent, mergedSettings);
  return {
    botFiles: { ...indexedFiles, mergedSettings },
    projectData: response.data,
    error: undefined,
  };
};

export const fetchProjectDataByPath = async (
  path,
  storageId
): Promise<{ botFiles: any; projectData: any; error: any }> => {
  try {
    const response = await httpClient.put(`/projects/open`, { path, storageId });
    const projectData = loadProjectData(response);
    return projectData;
  } catch (ex) {
    return {
      botFiles: undefined,
      projectData: undefined,
      error: ex,
    };
  }
};

export const fetchProjectDataById = async (projectId): Promise<{ botFiles: any; projectData: any; error: any }> => {
  try {
    const response = await httpClient.get(`/projects/${projectId}`);
    const { botFiles, projectData } = loadProjectData(response);
    return projectData;
  } catch (ex) {
    return {
      botFiles: undefined,
      projectData: undefined,
      error: ex,
    };
  }
};

export const parseFileProtocolPaths = (rootPath: string, relativePath): string => {
  try {
    const rootPathWithoutProtocol = rootPath.replace('file://', '');
    let skillPath = relativePath.replace('file://', '');
    if (skillPath) {
      skillPath = path.resolve(rootPathWithoutProtocol, skillPath);
    }
    return path.normalize(skillPath);
  } catch (ex) {
    throw new Error('Invalid path');
  }
};

export const handleProjectFailure = (callbackHelpers: CallbackInterface, ex) => {
  callbackHelpers.set(botProjectSpaceLoadedState, false);
  setError(callbackHelpers, ex);
};

export const processSchema = (projectId: string, schema: any) => ({
  ...schema,
  definitions: dereferenceDefinitions(schema.definitions),
});

// if user set value in terminal or appsetting.json, it should update the value in localStorage
export const refreshLocalStorage = (projectId: string, settings: DialogSetting) => {
  for (const property of SensitiveProperties) {
    const value = objectGet(settings, property);
    if (value) {
      settingStorage.setField(projectId, property, value);
    }
  }
};

export const updateLuFilesStatus = (projectId: string, luFiles: LuFile[]) => {
  const status = luFileStatusStorage.get(projectId);
  return luFiles.map((luFile) => {
    if (typeof status[luFile.id] === 'boolean') {
      return { ...luFile, published: status[luFile.id] };
    } else {
      return { ...luFile, published: false };
    }
  });
};

export const initLuFilesStatus = (projectId: string, luFiles: LuFile[], dialogs: DialogInfo[]) => {
  luFileStatusStorage.checkFileStatus(
    projectId,
    getReferredLuFiles(luFiles, dialogs).map((file) => file.id)
  );
  return updateLuFilesStatus(projectId, luFiles);
};

export const updateQnaFilesStatus = (projectId: string, qnaFiles: QnAFile[]) => {
  const status = qnaFileStatusStorage.get(projectId);
  return qnaFiles.map((qnaFile) => {
    if (typeof status[qnaFile.id] === 'boolean') {
      return { ...qnaFile, published: status[qnaFile.id] };
    } else {
      return { ...qnaFile, published: false };
    }
  });
};

export const initQnaFilesStatus = (projectId: string, qnaFiles: QnAFile[], dialogs: DialogInfo[]) => {
  qnaFileStatusStorage.checkFileStatus(
    projectId,
    getReferredQnaFiles(qnaFiles, dialogs).map((file) => file.id)
  );
  return updateQnaFilesStatus(projectId, qnaFiles);
};

export const initBotState = async (callbackHelpers: CallbackInterface, data: any, botFiles: any) => {
  const { snapshot, set } = callbackHelpers;
  const { botName, botEnvironment, location, schemas, settings, id: projectId, diagnostics } = data;
  const { dialogs, dialogSchemas, luFiles, lgFiles, qnaFiles, skillManifestFiles, skills, mergedSettings } = botFiles;
  const curLocation = await snapshot.getPromise(locationState(projectId));
  const storedLocale = languageStorage.get(botName)?.locale;
  const locale = settings.languages.includes(storedLocale) ? storedLocale : settings.defaultLanguage;

  try {
    schemas.sdk.content = processSchema(projectId, schemas.sdk.content);
  } catch (err) {
    const diagnostics = schemas.diagnostics ?? [];
    diagnostics.push(err.message);
    schemas.diagnostics = diagnostics;
  }

  let mainDialog = '';
  const verifiedDialogs = dialogs.map((dialog) => {
    if (dialog.isRoot) {
      mainDialog = dialog.id;
    }
    dialog.diagnostics = validateDialog(dialog, schemas.sdk.content, lgFiles, luFiles);
    return dialog;
  });

  await lgWorker.addProject(projectId, lgFiles);

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
  return mainDialog;
};

export const removeRecentProject = async (callbackHelpers: CallbackInterface, path: string) => {
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

export const openRemoteSkill = async (callbackHelpers: CallbackInterface, manifestUrl: string, name: string) => {
  const { set } = callbackHelpers;
  try {
    const response = await httpClient.get(`/projects/generate-projectId`);
    const projectId = response.data;
    const stringified = stringify({
      url: manifestUrl,
    });
    const manifestResponse = await httpClient.get(
      `/projects/${projectId}/skill/retrieve-skill-manifest?${stringified}`
    );
    set(projectMetaDataState(projectId), {
      isRootBot: false,
      isRemote: true,
    });
    set(botNameState(projectId), manifestResponse.data.name);
    set(locationState(projectId), manifestUrl);
    return { projectId };
  } catch (ex) {
    const tempProjectId = uuid();
    set(botNameState(tempProjectId), name);
    setErrorOnBotProject(callbackHelpers, tempProjectId, name, ex);
    return { projectId: tempProjectId };
  }
};

export const openLocalSkill = async (callbackHelpers, pathToBot: string, storageId, name?: string) => {
  const { set } = callbackHelpers;
  const { projectData, botFiles, error } = await fetchProjectDataByPath(pathToBot, storageId);
  if (!error) {
    const mainDialog = await initBotState(callbackHelpers, projectData, botFiles);
    set(projectMetaDataState(projectData.id), {
      isRootBot: false,
      isRemote: false,
    });
    return {
      projectId: projectData.id,
      mainDialog,
    };
  } else {
    const tempProjectId = uuid();
    set(botNameState(tempProjectId), name);
    setErrorOnBotProject(callbackHelpers, tempProjectId, name, error);
    return tempProjectId;
  }
};

export const createNewBotFromTemplate = async (
  callbackHelpers,
  templateId: string,
  name: string,
  description: string,
  location: string,
  schemaUrl?: string,
  locale?: string
) => {
  const response = await httpClient.post(`/projects`, {
    storageId: 'default',
    templateId,
    name,
    description,
    location,
    schemaUrl,
    locale,
  });
  const { botFiles, projectData } = loadProjectData(response);
  const projectId = response.data.id;
  if (settingStorage.get(projectId)) {
    settingStorage.remove(projectId);
  }
  const mainDialog = await initBotState(callbackHelpers, projectData, botFiles);
  return { projectId, mainDialog };
};

const addProjectToBotProjectSpace = (set, projectId: string, skillCt: number) => {
  set(botProjectIdsState, (current: string[]) => {
    const botProjectIDs = [...current, projectId];
    if (botProjectIDs.length === skillCt) {
      set(botProjectSpaceLoadedState, true);
    }
    return botProjectIDs;
  });
};

const openRootBotAndSkills = async (callbackHelpers: CallbackInterface, data, storageId = 'default') => {
  const { projectData, botFiles } = data;
  const { set } = callbackHelpers;

  const mainDialog = await initBotState(callbackHelpers, projectData, botFiles, true);
  const rootBotProjectId = projectData.id;

  if (botFiles.botProjectSpaceFiles.length) {
    const currentBotProjectFile: BotProjectSpace = botFiles.botProjectSpaceFiles[0];
    set(botProjectFileState(rootBotProjectId), currentBotProjectFile);

    const skillsInBotProject = currentBotProjectFile.skills;
    if (skillsInBotProject.length) {
      for (const skillInBotProject of skillsInBotProject) {
        if (!skillInBotProject.remote) {
          const path = parseFileProtocolPaths(currentBotProjectFile.workspace, skillInBotProject.workspace);
          //TODO handle exception
          openLocalSkill(callbackHelpers, path, storageId, skillInBotProject.name).then((result) =>
            addProjectToBotProjectSpace(set, result.projectId, skillsInBotProject.length)
          );
        } else {
          if (skillInBotProject.manifest) {
            openRemoteSkill(callbackHelpers, skillInBotProject.manifest, skillInBotProject.name).then((result) =>
              addProjectToBotProjectSpace(set, result.projectId, skillsInBotProject.length)
            );
          }
        }
      }
    }
  } else {
    set(botProjectSpaceLoadedState, true);
  }
  set(botProjectIdsState, [rootBotProjectId]);
  set(botOpeningState, false);
  set(currentProjectIdState, rootBotProjectId);
  return {
    mainDialog,
    projectId: rootBotProjectId,
  };
};

export const openRootBotAndSkillsByPath = async (callbackHelpers: CallbackInterface, path: string, storageId) => {
  const data = await fetchProjectDataByPath(path, storageId);
  const result = await openRootBotAndSkills(callbackHelpers, data, storageId);
  return result;
};

export const openRootBotAndSkillsByProjectId = async (callbackHelpers: CallbackInterface, projectId: string) => {
  const data = await fetchProjectDataById(projectId);
  const result = await openRootBotAndSkills(callbackHelpers, data);
  return result;
};
