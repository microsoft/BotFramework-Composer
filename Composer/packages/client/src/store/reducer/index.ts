import { ReducerFunc } from '../types';
import { getExtension } from '../../utils';
import { ActionTypes, FileTypes } from '../../constants';

import createReducer from './createReducer';

const projectFiles = ['bot', 'botproj'];

const getProjectSuccess: ReducerFunc = (state, { response }) => {
  state.dialogs = response.data.dialogs;
  state.botName = response.data.botName;
  state.lgFiles = response.data.lgFiles;
  state.schemas = response.data.schemas;
  state.luFiles = response.data.luFiles;
  return state;
};

const getRecentProjectsSuccess: ReducerFunc = (state, { response }) => {
  state.recentProjects = response.data;
  return state;
};

const updateDialog: ReducerFunc = (state, { response }) => {
  state.dialogs = response.data.dialogs;
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

const setPublishingLuFiles: ReducerFunc = (state, { unpublishedLuFileIds }) => {
  unpublishedLuFileIds.forEach(id => {
    const luFile = state.luFiles.find(f => f.id === id);
    if (luFile) luFile.publishing = true;
  });
  return state;
};

const resetPublishingLuFiles: ReducerFunc = (state, { publishingLuFileIds }) => {
  publishingLuFileIds.forEach(id => {
    const luFile = state.luFiles.find(f => f.id === id);
    if (luFile) delete luFile.publishing;
  });
  return state;
};

const setBotStatus: ReducerFunc = (state, { status }) => {
  return (state.botStatus = status);
};

const getStoragesSuccess: ReducerFunc = (state, { response }) => {
  return (state.storages = response.data);
};

const getStorageFileSuccess: ReducerFunc = (state, { response }) => {
  const focusedStorageFolder = response.data;
  focusedStorageFolder.children = focusedStorageFolder.children.reduce((files, file) => {
    if (file.type === FileTypes.FOLDER) {
      files.push(file);
    } else {
      const path = file.path;
      const extension = getExtension(path);
      if (projectFiles.indexOf(extension) >= 0) {
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

const updateOAuth: ReducerFunc = (state, { oAuth }) => {
  state.oAuth = oAuth;
  return state;
};

const setDesignPageLocation: ReducerFunc = (state, { dialogId, selected, focused, breadcrumb }) => {
  //generate focusedPath. This will remove when all focusPath related is removed
  state.focusPath = dialogId + '#';
  if (focused) {
    state.focusPath = dialogId + '#.' + focused;
  }

  //add current path to the breadcrumb
  breadcrumb.push({ dialogId, selected, focused });

  //if use navigateto to design page, add rules[0] for default select
  if (!selected) {
    selected = `rules[0]`;
    breadcrumb = [...breadcrumb, { dialogId, selected, focused }];
  }
  state.breadcrumb = breadcrumb;
  state.designPageLocation = { dialogId, selected, focused };
  return state;
};

export const reducer = createReducer({
  [ActionTypes.GET_PROJECT_SUCCESS]: getProjectSuccess,
  [ActionTypes.GET_RECENT_PROJECTS_SUCCESS]: getRecentProjectsSuccess,
  [ActionTypes.CREATE_DIALOG_BEGIN]: createDialogBegin,
  [ActionTypes.CREATE_DIALOG_CANCEL]: createDialogCancel,
  [ActionTypes.CREATE_DIALOG_SUCCESS]: createDialogSuccess,
  [ActionTypes.UPDATE_DIALOG]: updateDialog,
  [ActionTypes.REMOVE_DIALOG_SUCCESS]: removeDialog,
  [ActionTypes.SET_BOT_STATUS_SUCCESS]: setBotStatus,
  [ActionTypes.GET_STORAGE_SUCCESS]: getStoragesSuccess,
  [ActionTypes.SET_STORAGEFILE_FETCHING_STATUS]: setStorageFileFetchingStatus,
  [ActionTypes.GET_STORAGEFILE_SUCCESS]: getStorageFileSuccess,
  [ActionTypes.SET_CREATION_FLOW_STATUS]: setCreationFlowStatus,
  [ActionTypes.SAVE_TEMPLATE_ID]: saveTemplateId,
  [ActionTypes.UPDATE_LG_SUCCESS]: updateLgTemplate,
  [ActionTypes.CREATE_LG_SUCCCESS]: updateLgTemplate,
  [ActionTypes.REMOVE_LG_SUCCCESS]: updateLgTemplate,
  [ActionTypes.UPDATE_LU_SUCCESS]: updateLuTemplate,
  [ActionTypes.CREATE_LU_SUCCCESS]: updateLuTemplate,
  [ActionTypes.PUBLISH_LU_SUCCCESS]: updateLuTemplate,
  [ActionTypes.SET_PUBLISHING_LU]: setPublishingLuFiles,
  [ActionTypes.RESET_PUBLISHING_LU]: resetPublishingLuFiles,
  [ActionTypes.REMOVE_LU_SUCCCESS]: updateLuTemplate,
  [ActionTypes.CONNECT_BOT_SUCCESS]: setBotStatus,
  [ActionTypes.CONNECT_BOT_FAILURE]: setBotStatus,
  [ActionTypes.RELOAD_BOT_FAILURE]: setBotLoadErrorMsg,
  [ActionTypes.RELOAD_BOT_SUCCESS]: setBotLoadErrorMsg,
  [ActionTypes.UPDATE_OAUTH]: updateOAuth,
  [ActionTypes.SET_ERROR]: setError,
  [ActionTypes.SET_DESIGN_PAGE_LOCATION]: setDesignPageLocation,
} as { [type in ActionTypes]: ReducerFunc });
