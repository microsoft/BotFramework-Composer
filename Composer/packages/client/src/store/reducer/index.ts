// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { get, set } from 'lodash';
import { dialogIndexer } from '@bfc/indexers/lib/dialogIndexer';

import { ActionTypes, FileTypes, SensitiveProperties } from '../../constants';
import { DialogSetting, ReducerFunc } from '../types';
import { UserTokenPayload } from '../action/types';
import { getExtension } from '../../utils';
import settingStorage from '../../utils/dialogSettingStorage';

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
      }
    }
  }
};

const getProjectSuccess: ReducerFunc = (state, { response }) => {
  state.dialogs = response.data.dialogs;
  state.botEnvironment = response.data.botEnvironment || state.botEnvironment;
  state.botName = response.data.botName;
  state.location = response.data.location;
  state.lgFiles = response.data.lgFiles;
  state.schemas = response.data.schemas;
  state.luFiles = response.data.luFiles;
  state.settings = response.data.settings;
  refreshLocalStorage(response.data.botName, state.settings);
  mergeLocalStorage(response.data.botName, state.settings);
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
      const result = dialogIndexer.parse(content);
      return { ...dialog, ...result };
    }
    return dialog;
  });
  return state;
};

const removeDialog: ReducerFunc = (state, { response }) => {
  state.dialogs = response.data.dialogs;
  state.luFiles = response.data.luFiles;
  return state;
};

const createDialogBegin: ReducerFunc = (state, { onComplete }) => {
  state.showCreateDialogModal = true;
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
  state.luFiles = response.data.luFiles;
  state.showCreateDialogModal = false;
  delete state.onCreateDialogComplete;
  return state;
};

const updateLgTemplate: ReducerFunc = (state, { response }) => {
  state.lgFiles = response.data.lgFiles;
  return state;
};

const updateLuTemplate: ReducerFunc = (state, { response }) => {
  state.luFiles = response.data.luFiles;
  return state;
};

const setBotStatus: ReducerFunc = (state, { status, botEndpoint }) => {
  state.botEndpoint = botEndpoint || state.botEndpoint;
  state.botStatus = status;
  return state;
};

const updateRemoteEndpoint: ReducerFunc = (state, { slot, botEndpoint }) => {
  state.remoteEndpoints[slot] = botEndpoint;
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
  state.templateId = templateId;
  return state;
};

const setError: ReducerFunc = (state, payload) => {
  state.error = payload;
  return state;
};

const setDesignPageLocation: ReducerFunc = (state, { dialogId, selected, focused, breadcrumb, promptTab }) => {
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
  state.designPageLocation = { dialogId, selected, focused, promptTab };
  return state;
};
const syncEnvSetting: ReducerFunc = (state, { settings }) => {
  state.settings = settings;
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

const setPublishVersions: ReducerFunc = (state, { versions } = {}) => {
  state.publishVersions = versions;
  return state;
};

const updatePublishStatus: ReducerFunc = (state, payload) => {
  if (payload.versions) {
    state.publishStatus = 'ok';
  } else if (payload.error) {
    state.publishStatus = payload.error;
  } else if (payload.start === true) {
    state.publishStatus = 'start';
  }
  return state;
};

const setVisualEditorSelection: ReducerFunc = (state, { selection }) => {
  state.visualEditorSelection = selection;
  return state;
};

const setClipboardActions: ReducerFunc = (state, { clipboardActions }) => {
  state.clipboardActions = clipboardActions;
  return state;
};

const noOp: ReducerFunc = state => {
  return state;
};

export const reducer = createReducer({
  [ActionTypes.GET_PROJECT_SUCCESS]: getProjectSuccess,
  [ActionTypes.GET_PROJECT_FAILURE]: noOp,
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
  [ActionTypes.CONNECT_BOT_SUCCESS]: setBotStatus,
  [ActionTypes.RELOAD_BOT_SUCCESS]: setBotLoadErrorMsg,
  // [ActionTypes.RELOAD_BOT_FAILURE]: setBotLoadErrorMsg,
  [ActionTypes.SET_ERROR]: setError,
  [ActionTypes.SET_DESIGN_PAGE_LOCATION]: setDesignPageLocation,
  [ActionTypes.TO_START_BOT]: noOp,
  [ActionTypes.EDITOR_RESET_VISUAL]: noOp,
  [ActionTypes.SYNC_ENV_SETTING]: syncEnvSetting,
  [ActionTypes.USER_LOGIN_SUCCESS]: setUserToken,
  [ActionTypes.USER_LOGIN_FAILURE]: setUserToken, // will be invoked with token = undefined
  [ActionTypes.USER_SESSION_EXPIRED]: setUserSessionExpired,
  [ActionTypes.GET_PUBLISH_VERSIONS_SUCCESS]: setPublishVersions,
  [ActionTypes.PUBLISH_SUCCESS]: updatePublishStatus,
  [ActionTypes.PUBLISH_ERROR]: updatePublishStatus,
  [ActionTypes.PUBLISH_BEGIN]: updatePublishStatus,
  [ActionTypes.GET_ENDPOINT_SUCCESS]: updateRemoteEndpoint,
  [ActionTypes.REMOVE_RECENT_PROJECT]: removeRecentProject,
  [ActionTypes.EDITOR_SELECTION_VISUAL]: setVisualEditorSelection,
  [ActionTypes.EDITOR_CLIPBOARD]: setClipboardActions,
});
