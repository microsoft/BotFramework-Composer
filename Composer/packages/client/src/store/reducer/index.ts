// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import set from 'lodash/set';
import merge from 'lodash/merge';
import { indexer, dialogIndexer, lgIndexer, luIndexer, autofixReferInDialog } from '@bfc/indexers';
import { SensitiveProperties, LuFile, DialogInfo, importResolverGenerator } from '@bfc/shared';
import formatMessage from 'format-message';

import { ActionTypes, FileTypes, BotStatus, Text, AppUpdaterStatus } from '../../constants';
import { DialogSetting, ReducerFunc } from '../types';
import { UserTokenPayload } from '../action/types';
import { getExtension, getBaseName } from '../../utils';
import storage from '../../utils/storage';
import settingStorage from '../../utils/dialogSettingStorage';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import { getReferredFiles } from '../../utils/luUtil';

import createReducer from './createReducer';

const projectFiles = ['bot', 'botproj'];

// if user set value in terminal or appsetting.json, it should update the value in localStorage
const refreshLocalStorage = (botName: string, settings: DialogSetting) => {
  for (const property of SensitiveProperties) {
    const value = get(settings, property);
    if (value) {
      settingStorage.setField(botName, property, value);
    }
  }
};

// merge sensitive values in localStorage
const mergeLocalStorage = (botName: string, settings: DialogSetting) => {
  const localSetting = settingStorage.get(botName);
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

const updateLuFilesStatus = (botName: string, luFiles: LuFile[]) => {
  const status = luFileStatusStorage.get(botName);
  return luFiles.map(luFile => {
    if (typeof status[luFile.id] === 'boolean') {
      return { ...luFile, published: status[luFile.id] };
    } else {
      return { ...luFile, published: false };
    }
  });
};

const initLuFilesStatus = (botName: string, luFiles: LuFile[], dialogs: DialogInfo[]) => {
  luFileStatusStorage.checkFileStatus(
    botName,
    getReferredFiles(luFiles, dialogs).map(file => file.id)
  );
  return updateLuFilesStatus(botName, luFiles);
};

const getProjectSuccess: ReducerFunc = (state, { response }) => {
  const { files, botName, botEnvironment, location, schemas, settings, id, locale } = response.data;
  const { dialogs, luFiles, lgFiles, skillManifestFiles } = indexer.index(files, botName, schemas.sdk.content, locale);
  state.projectId = id;
  state.dialogs = dialogs;
  state.botEnvironment = botEnvironment || state.botEnvironment;
  state.botName = botName;
  state.botStatus = location === state.location ? state.botStatus : BotStatus.unConnected;
  state.location = location;
  state.lgFiles = lgFiles;
  state.skills = response.data.skills;
  state.schemas = schemas;
  state.luFiles = initLuFilesStatus(botName, luFiles, dialogs);
  state.settings = settings;
  state.locale = locale;
  state.skillManifests = skillManifestFiles;
  refreshLocalStorage(botName, state.settings);
  mergeLocalStorage(botName, state.settings);
  return state;
};

const getProjectFailure: ReducerFunc = (state, { error }) => {
  setError(state, error);
  return state;
};

const getRecentProjectsSuccess: ReducerFunc = (state, { response }) => {
  state.recentProjects = response.data;
  return state;
};

const removeRecentProject: ReducerFunc = (state, { path }) => {
  const recentProjects = state.recentProjects;
  const index = recentProjects.findIndex(p => p.path == path);
  recentProjects.splice(index, 1);
  state.recentProjects = recentProjects;
  return state;
};

const createLgFile: ReducerFunc = (state, { id, content }) => {
  const { lgFiles, locale } = state;
  id = `${id}.${locale}`;
  if (lgFiles.find(lg => lg.id === id)) {
    state.error = {
      message: `${id} ${formatMessage(`lg file already exist`)}`,
      summary: formatMessage('Creation Rejected'),
    };
    return state;
  }
  // slot with common.lg import
  let lgInitialContent = '';
  const lgCommonFile = lgFiles.find(({ id }) => id === `common.${locale}`);
  if (lgCommonFile) {
    lgInitialContent = `[import](common.lg)`;
  }
  content = [lgInitialContent, content].join('\n');

  const { parse } = lgIndexer;
  const lgImportresolver = importResolverGenerator(state.lgFiles, '.lg');
  const { templates, diagnostics } = parse(content, id, lgImportresolver);
  const lgFile = { id, templates, diagnostics, content };
  state.lgFiles.push(lgFile);
  return state;
};

const removeLgFile: ReducerFunc = (state, { id }) => {
  state.lgFiles = state.lgFiles.filter(file => getBaseName(file.id) !== id && file.id !== id);
  return state;
};

const updateLgTemplate: ReducerFunc = (state, { id, content }) => {
  const lgFiles = state.lgFiles.map(lgFile => {
    if (lgFile.id === id) {
      lgFile.content = content;
      return lgFile;
    }
    return lgFile;
  });
  const lgImportresolver = importResolverGenerator(lgFiles, '.lg');
  state.lgFiles = lgFiles.map(lgFile => {
    const { parse } = lgIndexer;
    const { id, content } = lgFile;
    const { templates, diagnostics } = parse(content, id, lgImportresolver);

    return { ...lgFile, templates, diagnostics, content };
  });
  return state;
};

const createLuFile: ReducerFunc = (state, { id, content }) => {
  const { luFiles, locale } = state;
  id = `${id}.${locale}`;
  if (luFiles.find(lu => lu.id === id)) {
    state.error = {
      message: `${id} ${formatMessage(`lu file already exist`)}`,
      summary: formatMessage('Creation Rejected'),
    };
    return state;
  }

  const { parse } = luIndexer;
  const luFile = { id, content, ...parse(content, id) };
  state.luFiles.push(luFile);
  luFileStatusStorage.updateFileStatus(state.botName, id);
  return state;
};

const removeLuFile: ReducerFunc = (state, { id }) => {
  state.luFiles = state.luFiles.reduce((result: LuFile[], file) => {
    if (getBaseName(file.id) === id || file.id === id) {
      luFileStatusStorage.removeFileStatus(state.botName, id);
    } else {
      result.push(file);
    }
    return result;
  }, []);
  return state;
};

const updateLuTemplate: ReducerFunc = (state, { id, content }) => {
  state.luFiles = state.luFiles.map(luFile => {
    if (luFile.id === id) {
      const { intents, diagnostics } = luIndexer.parse(content, id);
      return { ...luFile, intents, diagnostics, content };
    }
    return luFile;
  });

  luFileStatusStorage.updateFileStatus(state.botName, id);
  return state;
};

const updateDialog: ReducerFunc = (state, { id, content }) => {
  state.dialogs = state.dialogs.map(dialog => {
    if (dialog.id === id) {
      return { ...dialog, ...dialogIndexer.parse(dialog.id, content, state.schemas.sdk.content) };
    }
    return dialog;
  });
  return state;
};

const removeDialog: ReducerFunc = (state, { id }) => {
  state.dialogs = state.dialogs.filter(dialog => dialog.id !== id);
  //remove dialog should remove all locales lu and lg files
  state = removeLgFile(state, { id });
  state = removeLuFile(state, { id });
  return state;
};

const createDialogBegin: ReducerFunc = (state, { actionsSeed, onComplete }) => {
  state.showCreateDialogModal = true;
  state.actionsSeed = actionsSeed;
  state.onCreateDialogComplete = onComplete;
  return state;
};

const createDialogCancel: ReducerFunc = state => {
  state.showCreateDialogModal = false;
  delete state.onCreateDialogComplete;
  return state;
};

const createDialog: ReducerFunc = (state, { id, content }) => {
  const fixedContent = autofixReferInDialog(id, content);
  const dialog = {
    isRoot: false,
    displayName: id,
    ...dialogIndexer.parse(id, fixedContent, state.schemas.sdk.content),
  };
  state.dialogs.push(dialog);
  state = createLgFile(state, { id, content: '' });
  state = createLuFile(state, { id, content: '' });
  state.showCreateDialogModal = false;
  state.actionsSeed = [];
  delete state.onCreateDialogComplete;
  return state;
};

const publishLuisSuccess: ReducerFunc = state => {
  state.botStatus = BotStatus.published;
  return state;
};

const publishLuisFailure: ReducerFunc = (state, payload) => {
  state.botStatus = BotStatus.failed;
  state.botLoadErrorMsg = payload;
  return state;
};

const getStoragesSuccess: ReducerFunc = (state, { response }) => {
  return (state.storages = response.data);
};

const getStorageFileSuccess: ReducerFunc = (state, { response }) => {
  const focusedStorageFolder = response.data;
  focusedStorageFolder.children = focusedStorageFolder.children.reduce((files, file) => {
    if (file.type === FileTypes.FOLDER) {
      files.push(file);
    } else if (file.type === FileTypes.BOT) {
      files.push(file);
    } else {
      const path = file.path;
      const extension = getExtension(path);
      if (projectFiles.includes(extension)) {
        files.push(file);
      }
    }

    return files;
  }, []);
  state.storageFileLoadingStatus = 'success';
  state.focusedStorageFolder = focusedStorageFolder;
  return state;
};

const setStorageFileFetchingStatus: ReducerFunc = (state, { status }) => {
  state.storageFileLoadingStatus = status;
  return state;
};

const setBotLoadErrorMsg: ReducerFunc = (state, error) => {
  state.botLoadErrorMsg = error;
  return state;
};

const setCreationFlowStatus: ReducerFunc = (state, { creationFlowStatus }) => {
  state.creationFlowStatus = creationFlowStatus;
  return state;
};

const saveTemplateId: ReducerFunc = (state, { templateId }) => {
  if (!templateId) {
    return state;
  }
  state.templateId = templateId;
  return state;
};

const setError: ReducerFunc = (state, payload) => {
  // if the error originated at the server and the server included message, use it...
  if (payload && payload.status && payload.status === 409) {
    state.error = {
      status: 409,
      message: formatMessage(
        'This version of the content is out of date, and your last change was rejected. The content will be automatically refreshed.'
      ),
      summary: formatMessage('Modification Rejected'),
    };
  } else {
    if (payload && payload.response && payload.response.data && payload.response.data.message) {
      state.error = payload.response.data;
    } else {
      state.error = payload;
    }
  }

  if (state.error) {
    // warn this error out to the console.
    console.error('ERROR', state.error);
  }

  return state;
};

const setDesignPageLocation: ReducerFunc = (
  state,
  { projectId, dialogId, selected, focused, breadcrumb, promptTab }
) => {
  //generate focusedPath. This will remove when all focusPath related is removed
  state.focusPath = dialogId + '#';
  if (focused) {
    state.focusPath = dialogId + '#.' + focused;
  } else if (selected) {
    state.focusPath = dialogId + '#.' + selected;
  }

  //add current path to the breadcrumb
  breadcrumb.push({ dialogId, selected, focused });

  state.breadcrumb = breadcrumb;
  state.designPageLocation = { dialogId, projectId, selected, focused, promptTab };
  return state;
};

const updateSkill: ReducerFunc = (state, { skills }) => {
  state.skills = skills;
  state.settings.skill = skills.map(({ manifestUrl, name }) => {
    return { manifestUrl, name };
  });

  state.showAddSkillDialogModal = false;
  delete state.onAddSkillDialogComplete;

  return state;
};

const addSkillDialogBegin: ReducerFunc = (state, { onComplete }) => {
  state.showAddSkillDialogModal = true;
  state.onAddSkillDialogComplete = onComplete;
  return state;
};

const addSkillDialogCancel: ReducerFunc = state => {
  state.showAddSkillDialogModal = false;
  delete state.onAddSkillDialogComplete;
  return state;
};

const createSkillManifest: ReducerFunc = (state, { content = {}, id }) => {
  state.skillManifests = [...state.skillManifests, { content, id }];
  return state;
};

const updateSkillManifest: ReducerFunc = (state, payload) => {
  state.skillManifests = state.skillManifests.map(manifest => (manifest.id === payload.id ? payload : manifest));
  return state;
};

const removeSkillManifest: ReducerFunc = (state, { id }) => {
  state.skillManifests = state.skillManifests.filter(manifest => manifest.name === id);
  return state;
};

const syncEnvSetting: ReducerFunc = (state, { settings }) => {
  state.settings = settings;
  return state;
};

const getEnvSetting: ReducerFunc = (state, { settings }) => {
  state.settings = settings;
  refreshLocalStorage(state.botName, state.settings);
  mergeLocalStorage(state.botName, state.settings);
  return state;
};

const setTemplateProjects: ReducerFunc = (state, { response } = {}) => {
  const data = response && response.data;

  if (data && Array.isArray(data) && data.length > 0) {
    state.templateProjects = data;
  }
  return state;
};

const setUserToken: ReducerFunc<UserTokenPayload> = (state, user = {}) => {
  if (user.token) {
    state.currentUser = {
      ...user,
      token: user.token,
      sessionExpired: false,
    };
  } else {
    state.currentUser = {
      token: null,
      sessionExpired: false,
    };
  }

  return state;
};

const setUserSessionExpired: ReducerFunc = (state, { expired } = {}) => {
  state.currentUser.sessionExpired = !!expired;

  return state;
};

const setPublishTypes: ReducerFunc = (state, { typelist }) => {
  state.publishTypes = typelist;
  return state;
};

const publishSuccess: ReducerFunc = (state, payload) => {
  if (payload.target.name === 'default' && payload.endpointURL) {
    state.botEndpoints[state.projectId] = `${payload.endpointURL}/api/messages`;
    state.botStatus = BotStatus.connected;
  }

  // prepend the latest publish results to the history
  if (!state.publishHistory[payload.target.name]) {
    state.publishHistory[payload.target.name] = [];
  }
  state.publishHistory[payload.target.name].unshift(payload);

  return state;
};

const publishFailure: ReducerFunc = (state, { error, target }) => {
  if (target.name === 'default') {
    state.botStatus = BotStatus.failed;
    state.botLoadErrorMsg = { title: Text.CONNECTBOTFAILURE, message: error.message };
  }
  // prepend the latest publish results to the history
  if (!state.publishHistory[target.name]) {
    state.publishHistory[target.name] = [];
  }
  state.publishHistory[target.name].unshift(error);
  return state;
};

const getPublishStatus: ReducerFunc = (state, payload) => {
  // the action below only applies to when a bot is being started using the "start bot" button
  // a check should be added to this that ensures this ONLY applies to the "default" profile.
  if (payload.target.name === 'default' && payload.endpointURL) {
    state.botStatus = BotStatus.connected;
    state.botEndpoints[state.projectId] = `${payload.endpointURL}/api/messages`;
  }

  // if no history exists, create one with the latest status
  // otherwise, replace the latest publish history with this one
  if (!state.publishHistory[payload.target.name] && payload.status !== 404) {
    state.publishHistory[payload.target.name] = [payload];
  } else if (payload.status !== 404) {
    // make sure this status payload represents the same item as item 0 (most of the time)
    // otherwise, prepend it to the list to indicate a NEW publish has occurred since last loading history
    if (
      state.publishHistory[payload.target.name].length &&
      state.publishHistory[payload.target.name][0].id === payload.id
    ) {
      state.publishHistory[payload.target.name][0] = payload;
    } else {
      state.publishHistory[payload.target.name].unshift(payload);
    }
  }
  return state;
};

const getPublishHistory: ReducerFunc = (state, payload) => {
  state.publishHistory[payload.target.name] = payload.history;
  return state;
};

const setRuntimeTemplates: ReducerFunc = (state, payload) => {
  state.runtimeTemplates = payload;
  return state;
};

const setBotStatus: ReducerFunc = (state, payload) => {
  state.botStatus = payload.status;
  return state;
};

const setVisualEditorSelection: ReducerFunc = (state, { selection }) => {
  state.visualEditorSelection = selection;
  return state;
};

const onboardingAddCoachMarkRef: ReducerFunc = (state, { ref }) => {
  state.onboarding.coachMarkRefs = { ...state.onboarding.coachMarkRefs, ...ref };
  return state;
};

const onboardingSetComplete: ReducerFunc = (state, { complete }) => {
  state.onboarding.complete = complete;
  return state;
};

const setClipboardActions: ReducerFunc = (state, { clipboardActions }) => {
  state.clipboardActions = clipboardActions;
  return state;
};

const setCodeEditorSettings: ReducerFunc = (state, settings) => {
  const newSettings = merge(state.userSettings, settings);
  storage.set('userSettings', newSettings);
  state.userSettings = newSettings;
  return state;
};

const ejectSuccess: ReducerFunc = (state, payload) => {
  state.runtimeSettings = payload.settings;
  return state;
};

const setMessage: ReducerFunc = (state, message) => {
  state.announcement = message;
  return state;
};

const setAppUpdateError: ReducerFunc<any> = (state, error) => {
  state.appUpdate.error = error;
  return state;
};

const setAppUpdateProgress: ReducerFunc<{ progressPercent: number; downloadSizeInBytes: number }> = (
  state,
  { downloadSizeInBytes, progressPercent }
) => {
  if (downloadSizeInBytes !== state.appUpdate.downloadSizeInBytes) {
    state.appUpdate.downloadSizeInBytes = downloadSizeInBytes;
  }
  state.appUpdate.progressPercent = progressPercent;
  return state;
};

const setAppUpdateShowing: ReducerFunc<boolean> = (state, payload) => {
  state.appUpdate.showing = payload;
  return state;
};

const setAppUpdateStatus: ReducerFunc<{ status: AppUpdaterStatus; version?: string }> = (state, payload) => {
  const { status, version } = payload;
  if (state.appUpdate.status !== status) {
    state.appUpdate.status;
  }
  state.appUpdate.status = status;
  if (status === AppUpdaterStatus.UPDATE_AVAILABLE) {
    state.appUpdate.version = version;
  }
  if (status === AppUpdaterStatus.IDLE) {
    state.appUpdate.progressPercent = 0;
    state.appUpdate.version = undefined;
  }
  return state;
};

const noOp: ReducerFunc = state => {
  return state;
};

export const reducer = createReducer({
  [ActionTypes.GET_PROJECT_SUCCESS]: getProjectSuccess,
  [ActionTypes.GET_PROJECT_FAILURE]: getProjectFailure,
  [ActionTypes.GET_RECENT_PROJECTS_SUCCESS]: getRecentProjectsSuccess,
  [ActionTypes.GET_RECENT_PROJECTS_FAILURE]: noOp,
  [ActionTypes.GET_TEMPLATE_PROJECTS_SUCCESS]: setTemplateProjects,
  [ActionTypes.GET_TEMPLATE_PROJECTS_FAILURE]: noOp,
  [ActionTypes.CREATE_DIALOG_BEGIN]: createDialogBegin,
  [ActionTypes.CREATE_DIALOG_CANCEL]: createDialogCancel,
  [ActionTypes.CREATE_DIALOG]: createDialog,
  [ActionTypes.UPDATE_DIALOG]: updateDialog,
  [ActionTypes.REMOVE_DIALOG]: removeDialog,
  [ActionTypes.GET_STORAGE_SUCCESS]: getStoragesSuccess,
  [ActionTypes.GET_STORAGE_FAILURE]: noOp,
  [ActionTypes.SET_STORAGEFILE_FETCHING_STATUS]: setStorageFileFetchingStatus,
  [ActionTypes.GET_STORAGEFILE_SUCCESS]: getStorageFileSuccess,
  [ActionTypes.SET_CREATION_FLOW_STATUS]: setCreationFlowStatus,
  [ActionTypes.SAVE_TEMPLATE_ID]: saveTemplateId,
  [ActionTypes.UPDATE_LG]: updateLgTemplate,
  [ActionTypes.CREATE_LG]: createLgFile,
  [ActionTypes.REMOVE_LG]: removeLgFile,
  [ActionTypes.UPDATE_LU]: updateLuTemplate,
  [ActionTypes.CREATE_LU]: createLuFile,
  [ActionTypes.REMOVE_LU]: removeLuFile,
  [ActionTypes.PUBLISH_LU_SUCCCESS]: publishLuisSuccess,
  [ActionTypes.PUBLISH_LU_FAILED]: publishLuisFailure,
  [ActionTypes.RELOAD_BOT_FAILURE]: setBotLoadErrorMsg,
  [ActionTypes.SET_ERROR]: setError,
  [ActionTypes.SET_DESIGN_PAGE_LOCATION]: setDesignPageLocation,
  [ActionTypes.EDITOR_RESET_VISUAL]: noOp,
  [ActionTypes.UPDATE_SKILL_SUCCESS]: updateSkill,
  [ActionTypes.ADD_SKILL_DIALOG_BEGIN]: addSkillDialogBegin,
  [ActionTypes.ADD_SKILL_DIALOG_END]: addSkillDialogCancel,
  [ActionTypes.CREATE_SKILL_MANIFEST]: createSkillManifest,
  [ActionTypes.REMOVE_SKILL_MANIFEST]: removeSkillManifest,
  [ActionTypes.UPDATE_SKILL_MANIFEST]: updateSkillManifest,
  [ActionTypes.SYNC_ENV_SETTING]: syncEnvSetting,
  [ActionTypes.GET_ENV_SETTING]: getEnvSetting,
  [ActionTypes.USER_LOGIN_SUCCESS]: setUserToken,
  [ActionTypes.USER_LOGIN_FAILURE]: setUserToken, // will be invoked with token = undefined
  [ActionTypes.USER_SESSION_EXPIRED]: setUserSessionExpired,
  [ActionTypes.GET_PUBLISH_TYPES_SUCCESS]: setPublishTypes,
  [ActionTypes.PUBLISH_SUCCESS]: publishSuccess,
  [ActionTypes.PUBLISH_FAILED]: publishFailure,
  [ActionTypes.GET_PUBLISH_STATUS]: getPublishStatus,
  [ActionTypes.GET_PUBLISH_STATUS_FAILED]: getPublishStatus,
  [ActionTypes.GET_PUBLISH_HISTORY]: getPublishHistory,
  [ActionTypes.REMOVE_RECENT_PROJECT]: removeRecentProject,
  [ActionTypes.EDITOR_SELECTION_VISUAL]: setVisualEditorSelection,
  [ActionTypes.ONBOARDING_ADD_COACH_MARK_REF]: onboardingAddCoachMarkRef,
  [ActionTypes.ONBOARDING_SET_COMPLETE]: onboardingSetComplete,
  [ActionTypes.EDITOR_CLIPBOARD]: setClipboardActions,
  [ActionTypes.UPDATE_BOTSTATUS]: setBotStatus,
  [ActionTypes.SET_RUNTIME_TEMPLATES]: setRuntimeTemplates,
  [ActionTypes.SET_USER_SETTINGS]: setCodeEditorSettings,
  [ActionTypes.EJECT_SUCCESS]: ejectSuccess,
  [ActionTypes.SET_MESSAGE]: setMessage,
  [ActionTypes.SET_APP_UPDATE_ERROR]: setAppUpdateError,
  [ActionTypes.SET_APP_UPDATE_PROGRESS]: setAppUpdateProgress,
  [ActionTypes.SET_APP_UPDATE_SHOWING]: setAppUpdateShowing,
  [ActionTypes.SET_APP_UPDATE_STATUS]: setAppUpdateStatus,
});
