// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { v4 as uuid } from 'uuid';
import {
  SensitiveProperties,
  convertSkillsToDictionary,
  DialogSetting,
  dereferenceDefinitions,
  DialogInfo,
  LuFile,
  QnAFile,
  BotProjectSpace,
  BotProjectFile,
  BotProjectSpaceSkill,
  convertFileProtocolToPath,
} from '@bfc/shared';
import objectGet from 'lodash/get';
import objectSet from 'lodash/set';
import { indexer, validateDialog } from '@bfc/indexers';
import { CallbackInterface } from 'recoil';
import { stringify } from 'query-string';
import formatMessage from 'format-message';
import camelCase from 'lodash/camelCase';

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
  botErrorState,
  botNameIdentifierState,
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
  botDisplayNameState,
  botEnvironmentState,
  dialogsState,
  dialogSchemasState,
} from '../../atoms';
import { undoHistoryState } from '../../undo/history';
import { rootBotProjectIdSelector } from '../../selectors';
import { getUniqueName } from '../../../utils/fileUtil';

export const resetBotStates = async ({ reset }: CallbackInterface, projectId: string) => {
  const botStates = Object.keys(botstates);
  botStates.forEach((state) => {
    const currentRecoilAtom: any = botstates[state];
    reset(currentRecoilAtom(projectId));
  });
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
  reset(botProjectSpaceLoadedState);
  const projectIds = await snapshot.getPromise(botProjectIdsState);
  reset(botProjectIdsState, []);
  for (const projectId of projectIds) {
    resetBotStates(callbackHelpers, projectId);
  }
  const workers = [lgWorker, luWorker, qnaWorker];

  return Promise.all([workers.map((w) => w.flush())]);
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

export const navigateToBot = (
  callbackHelpers: CallbackInterface,
  projectId: string,
  mainDialog: string,
  qnaKbUrls?: string[],
  templateId?: string
) => {
  if (projectId) {
    const { set } = callbackHelpers;
    set(currentProjectIdState, projectId);
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
  path: string,
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

export const handleProjectFailure = (callbackHelpers: CallbackInterface, ex) => {
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
  set(botDisplayNameState(projectId), botName);
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

export const openRemoteSkill = async (
  callbackHelpers: CallbackInterface,
  manifestUrl: string,
  botNameIdentifier: string
) => {
  const { set } = callbackHelpers;

  const response = await httpClient.get(`/projects/generateProjectId`);
  const projectId = response.data;
  const stringified = stringify({
    url: manifestUrl,
  });
  const manifestResponse = await httpClient.get(
    `/projects/${projectId}/skill/retrieveSkillManifest?${stringified}&ignoreProjectValidation=true`
  );
  set(projectMetaDataState(projectId), {
    isRootBot: false,
    isRemote: true,
  });
  set(botNameIdentifierState(projectId), botNameIdentifier);
  set(botDisplayNameState(projectId), manifestResponse.data.name);
  set(locationState(projectId), manifestUrl);
  return { projectId, manifestResponse: manifestResponse.data };
};

export const openLocalSkill = async (callbackHelpers, pathToBot: string, storageId, botNameIdentifier: string) => {
  const { set } = callbackHelpers;
  const { projectData, botFiles, error } = await fetchProjectDataByPath(pathToBot, storageId);

  if (error) {
    throw error;
  }
  const mainDialog = await initBotState(callbackHelpers, projectData, botFiles);
  set(projectMetaDataState(projectData.id), {
    isRootBot: false,
    isRemote: false,
  });
  set(botNameIdentifierState(projectData.id), botNameIdentifier);

  return {
    projectId: projectData.id,
    mainDialog,
  };
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
  const { set } = callbackHelpers;
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
  const currentBotProjectFileIndexed: BotProjectFile = botFiles.botProjectSpaceFiles[0];
  set(botProjectFileState(projectId), currentBotProjectFileIndexed);
  const mainDialog = await initBotState(callbackHelpers, projectData, botFiles);
  return { projectId, mainDialog };
};

const addProjectToBotProjectSpace = (set, projectId: string, skillCt: number) => {
  let isBotProjectLoaded = false;
  set(botProjectIdsState, (current: string[]) => {
    const botProjectIds = [...current, projectId];
    if (botProjectIds.length === skillCt) {
      isBotProjectLoaded = true;
    }
    return botProjectIds;
  });
  if (isBotProjectLoaded) {
    set(botProjectSpaceLoadedState, true);
  }
};

const handleSkillLoadingFailure = (callbackHelpers, { ex, skillNameIdentifier }) => {
  const { set } = callbackHelpers;
  // Generating a dummy project id which will be replaced by the user from the UI.
  const projectId = uuid();
  set(botDisplayNameState(projectId), skillNameIdentifier);
  set(botNameIdentifierState(projectId), skillNameIdentifier);
  setErrorOnBotProject(callbackHelpers, projectId, skillNameIdentifier, ex);
  return projectId;
};

const openRootBotAndSkills = async (callbackHelpers: CallbackInterface, data, storageId = 'default') => {
  const { projectData, botFiles } = data;
  const { set } = callbackHelpers;

  const mainDialog = await initBotState(callbackHelpers, projectData, botFiles);
  const rootBotProjectId = projectData.id;
  const { name } = projectData;
  set(botNameIdentifierState(rootBotProjectId), camelCase(name));

  if (botFiles.botProjectSpaceFiles && botFiles.botProjectSpaceFiles.length) {
    const currentBotProjectFileIndexed: BotProjectFile = botFiles.botProjectSpaceFiles[0];
    set(botProjectFileState(rootBotProjectId), currentBotProjectFileIndexed);
    const currentBotProjectFile: BotProjectSpace = currentBotProjectFileIndexed.content;

    const skills: { [skillId: string]: BotProjectSpaceSkill } = {
      ...currentBotProjectFile.skills,
    };

    // RootBot loads first + skills load async
    const totalProjectsCount = Object.keys(skills).length + 1;
    if (totalProjectsCount > 0) {
      for (const nameIdentifier in skills) {
        const skill = skills[nameIdentifier];
        let skillPromise;
        if (!skill.remote && skill.workspace) {
          const skillPath = convertFileProtocolToPath(skill.workspace);
          skillPromise = openLocalSkill(callbackHelpers, skillPath, storageId, nameIdentifier);
        } else if (skill.manifest) {
          skillPromise = openRemoteSkill(callbackHelpers, skill.manifest, nameIdentifier);
        }
        if (skillPromise) {
          skillPromise
            .then(({ projectId }) => {
              addProjectToBotProjectSpace(set, projectId, totalProjectsCount);
            })
            .catch((ex) => {
              const projectId = handleSkillLoadingFailure(callbackHelpers, {
                skillNameIdentifier: nameIdentifier,
                ex,
              });
              addProjectToBotProjectSpace(set, projectId, totalProjectsCount);
            });
        }
      }
    }
  } else {
    // Should never hit here as all projects should have a botproject file
    throw new Error(formatMessage('Bot project file does not exist.'));
  }
  set(botProjectIdsState, [rootBotProjectId]);
  set(currentProjectIdState, rootBotProjectId);
  return {
    mainDialog,
    projectId: rootBotProjectId,
  };
};

export const openRootBotAndSkillsByPath = async (callbackHelpers: CallbackInterface, path: string, storageId) => {
  const data = await fetchProjectDataByPath(path, storageId);
  if (data.error) {
    throw data.error;
  }
  return await openRootBotAndSkills(callbackHelpers, data, storageId);
};

export const openRootBotAndSkillsByProjectId = async (callbackHelpers: CallbackInterface, projectId: string) => {
  const data = await fetchProjectDataById(projectId);
  if (data.error) {
    throw data.error;
  }
  return await openRootBotAndSkills(callbackHelpers, data);
};

export const saveProject = async (callbackHelpers, oldProjectData) => {
  const { oldProjectId, name, description, location } = oldProjectData;
  const response = await httpClient.post(`/projects/${oldProjectId}/project/saveAs`, {
    storageId: 'default',
    name,
    description,
    location,
  });
  const data = loadProjectData(response);
  if (data.error) {
    throw data.error;
  }
  const result = openRootBotAndSkills(callbackHelpers, data);
  return result;
};

export const getSkillNameIdentifier = async (
  callbackHelpers: CallbackInterface,
  displayName: string
): Promise<string> => {
  const { snapshot } = callbackHelpers;
  const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
  if (rootBotProjectId) {
    const { content: botProjectFile } = await snapshot.getPromise(botProjectFileState(rootBotProjectId));
    return getUniqueName(Object.keys(botProjectFile.skills), camelCase(displayName));
  }
  return '';
};

export const checkIfBotExistsInBotProjectFile = async (
  callbackHelpers: CallbackInterface,
  pathOrManifest: string,
  remote?: boolean
) => {
  const { snapshot } = callbackHelpers;
  const rootBotProjectId = await snapshot.getPromise(rootBotProjectIdSelector);
  if (!rootBotProjectId) {
    throw new Error(formatMessage('The root bot is not a bot project'));
  }
  const { content: botProjectFile } = await snapshot.getPromise(botProjectFileState(rootBotProjectId));

  for (const uniqueSkillName in botProjectFile.skills) {
    const { manifest, workspace } = botProjectFile.skills[uniqueSkillName];
    if (remote) {
      if (manifest === pathOrManifest) {
        return true;
      }
    } else {
      if (workspace) {
        const resolvedPath = convertFileProtocolToPath(workspace);
        if (pathOrManifest === resolvedPath) {
          return true;
        }
      }
    }
  }
  return false;
};
