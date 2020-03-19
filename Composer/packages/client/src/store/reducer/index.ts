// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';
import set from 'lodash/set';
import { dialogIndexer, lgIndexer, luIndexer } from '@bfc/indexers';
import { SensitiveProperties, Diagnostic, DiagnosticSeverity, LgTemplate, LuFile, DialogInfo } from '@bfc/shared';
import formatMessage from 'format-message';
import { ImportResolverDelegate } from 'botbuilder-lg';

import { ActionTypes, FileTypes, BotStatus } from '../../constants';
import { DialogSetting, ReducerFunc } from '../types';
import { UserTokenPayload } from '../action/types';
import { getExtension, getFileName, getBaseName } from '../../utils';
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
  getReferredFiles(luFiles, dialogs).forEach(luFile => {
    luFileStatusStorage.checkFileStatus(botName, luFile.id);
  });
  return updateLuFilesStatus(botName, luFiles);
};

const getProjectSuccess: ReducerFunc = (state, { response }) => {
  const { dialogs, botName, luFiles, id } = response.data;
  state.projectId = id;
  state.dialogs = dialogs;
  state.botEnvironment = response.data.botEnvironment || state.botEnvironment;
  state.botName = botName;
  state.location = response.data.location;
  state.lgFiles = response.data.lgFiles;
  state.schemas = response.data.schemas;
  state.luFiles = initLuFilesStatus(botName, luFiles, dialogs);
  state.settings = response.data.settings;
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

const updateDialog: ReducerFunc = (state, { id, content }) => {
  state.dialogs = state.dialogs.map(dialog => {
    if (dialog.id === id) {
      const result = dialogIndexer.parse(dialog.id, content, state.schemas.sdk.content);
      return { ...dialog, ...result };
    }
    return dialog;
  });
  return state;
};

const removeDialog: ReducerFunc = (state, { response }) => {
  state.dialogs = response.data.dialogs;
  state.luFiles = updateLuFilesStatus(state.botName, response.data.luFiles);
  state.lgFiles = response.data.lgFiles;
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

const createDialogSuccess: ReducerFunc = (state, { response }) => {
  state.dialogs = response.data.dialogs;
  state.luFiles = updateLuFilesStatus(state.botName, response.data.luFiles);
  state.lgFiles = response.data.lgFiles;
  state.showCreateDialogModal = false;
  state.actionsSeed = [];
  delete state.onCreateDialogComplete;
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
  const lgImportresolver: ImportResolverDelegate = function(_source: string, id: string) {
    const targetFileName = getFileName(id);
    const targetFileId = getBaseName(targetFileName);
    const targetFile = lgFiles.find(({ id }) => id === targetFileId);
    if (!targetFile) throw new Error(`file not found`);
    return { id, content: targetFile.content };
  };

  state.lgFiles = lgFiles.map(lgFile => {
    const { check, parse } = lgIndexer;
    const { id, content } = lgFile;
    const diagnostics = check(content, id, lgImportresolver);
    let templates: LgTemplate[] = [];
    try {
      templates = parse(content, id);
    } catch (err) {
      diagnostics.push(new Diagnostic(err.message, id, DiagnosticSeverity.Error));
    }
    return { ...lgFile, templates, diagnostics, content };
  });
  return state;
};

const updateLuTemplate: ReducerFunc = (state, { id, content }) => {
  const luFiles = state.luFiles.map(luFile => {
    if (luFile.id === id) {
      luFile.content = content;
      return luFile;
    }
    return luFile;
  });

  state.luFiles = updateLuFilesStatus(
    state.botName,
    luFiles.map(luFile => {
      const { parse } = luIndexer;
      const { id, content } = luFile;
      const { intents, diagnostics } = parse(content, id);
      return { ...luFile, intents, diagnostics, content };
    })
  );
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

const setBotLoadErrorMsg: ReducerFunc = (state, { error }) => {
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

const setPublishTypes: ReducerFunc = (state, { response }) => {
  state.publishTypes = response;
  return state;
};

const publishSuccess: ReducerFunc = (state, payload) => {
  console.log('Got publish status from remote', payload);
  state.botEndpoints[state.projectId] = `${payload.results?.result?.endpoint || 'http://localhost:3979'}/api/messages`;
  state.botStatus = BotStatus.connected;

  return state;
};

const publishFailure: ReducerFunc = (state, payload) => {
  state.botStatus = BotStatus.unConnected;
  return state;
};

const getPublishStatus: ReducerFunc = (state, payload) => {
  if (payload.results?.botStatus === 'connected') {
    state.botStatus = BotStatus.connected;
  } else {
    state.botStatus = BotStatus.unConnected;
  }
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

const updateTimestamp: ReducerFunc = (state, { id, type, lastModified }) => {
  if (type === 'dialog') {
    const dialog = state.dialogs.find(d => d.id === id);
    if (dialog) {
      dialog.lastModified = lastModified;
    }
  } else if (type === 'lg') {
    const lg = state.lgFiles.find(d => d.id === id);
    if (lg) {
      lg.lastModified = lastModified;
    }
  } else if (type === 'lu') {
    const lu = state.luFiles.find(d => d.id === id);
    if (lu) {
      lu.lastModified = lastModified;
    }
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
  [ActionTypes.CREATE_DIALOG_SUCCESS]: createDialogSuccess,
  [ActionTypes.UPDATE_DIALOG]: updateDialog,
  [ActionTypes.REMOVE_DIALOG]: removeDialog,
  [ActionTypes.GET_STORAGE_SUCCESS]: getStoragesSuccess,
  [ActionTypes.GET_STORAGE_FAILURE]: noOp,
  [ActionTypes.SET_STORAGEFILE_FETCHING_STATUS]: setStorageFileFetchingStatus,
  [ActionTypes.GET_STORAGEFILE_SUCCESS]: getStorageFileSuccess,
  [ActionTypes.SET_CREATION_FLOW_STATUS]: setCreationFlowStatus,
  [ActionTypes.SAVE_TEMPLATE_ID]: saveTemplateId,
  [ActionTypes.UPDATE_LG_SUCCESS]: updateLgTemplate,
  [ActionTypes.UPDATE_LG_FAILURE]: noOp,
  [ActionTypes.CREATE_LG_SUCCCESS]: updateLgTemplate,
  [ActionTypes.CREATE_LG_FAILURE]: noOp,
  [ActionTypes.REMOVE_LG_SUCCCESS]: updateLgTemplate,
  [ActionTypes.REMOVE_LG_FAILURE]: noOp,
  [ActionTypes.UPDATE_LU_SUCCESS]: updateLuTemplate,
  [ActionTypes.UPDATE_LU_FAILURE]: noOp,
  [ActionTypes.CREATE_LU_SUCCCESS]: updateLuTemplate,
  [ActionTypes.CREATE_LU_FAILURE]: noOp,
  [ActionTypes.REMOVE_LU_SUCCCESS]: updateLuTemplate,
  [ActionTypes.REMOVE_LU_FAILURE]: noOp,
  [ActionTypes.PUBLISH_LU_SUCCCESS]: updateLuTemplate,
  [ActionTypes.RELOAD_BOT_SUCCESS]: setBotLoadErrorMsg,
  // [ActionTypes.RELOAD_BOT_FAILURE]: setBotLoadErrorMsg,
  [ActionTypes.SET_ERROR]: setError,
  [ActionTypes.SET_DESIGN_PAGE_LOCATION]: setDesignPageLocation,
  [ActionTypes.TO_START_BOT]: noOp,
  [ActionTypes.EDITOR_RESET_VISUAL]: noOp,
  [ActionTypes.SYNC_ENV_SETTING]: syncEnvSetting,
  [ActionTypes.GET_ENV_SETTING]: getEnvSetting,
  [ActionTypes.USER_LOGIN_SUCCESS]: setUserToken,
  [ActionTypes.USER_LOGIN_FAILURE]: setUserToken, // will be invoked with token = undefined
  [ActionTypes.USER_SESSION_EXPIRED]: setUserSessionExpired,
  [ActionTypes.GET_PUBLISH_TYPES_SUCCESS]: setPublishTypes,
  [ActionTypes.PUBLISH_SUCCESS]: publishSuccess,
  [ActionTypes.PUBLISH_FAILED]: publishFailure,
  [ActionTypes.GET_PUBLISH_STATUS]: getPublishStatus,
  [ActionTypes.REMOVE_RECENT_PROJECT]: removeRecentProject,
  [ActionTypes.EDITOR_SELECTION_VISUAL]: setVisualEditorSelection,
  [ActionTypes.ONBOARDING_ADD_COACH_MARK_REF]: onboardingAddCoachMarkRef,
  [ActionTypes.ONBOARDING_SET_COMPLETE]: onboardingSetComplete,
  [ActionTypes.EDITOR_CLIPBOARD]: setClipboardActions,
  [ActionTypes.UPDATE_TIMESTAMP]: updateTimestamp,
});
