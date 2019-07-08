import createReducer from './createReducer';
import { getExtension } from './../../utils';
import { ActionTypes, FileTypes } from './../../constants/index';

const projectFiles = ['bot', 'botproj'];

const getProjectSuccess = (state, { response }) => {
  state.dialogs = response.data.dialogs;
  state.botName = response.data.botName;
  state.botProjFile = response.data.botFile;
  state.lgFiles = response.data.lgFiles;
  state.schemas = response.data.schemas;
  state.luFiles = response.data.luFiles;
  state.luStatus = response.data.luStatus;
  return state;
};

const updateDialog = (state, { response }) => {
  state.dialogs = response.data.dialogs;
  return state;
};

const createDialogSuccess = (state, { response }) => {
  state.dialogs = response.data.dialogs;
  state.luFiles = response.data.luFiles;
  return state;
};

const updateLgTemplate = (state, { response }) => {
  state.lgFiles = response.data.lgFiles;
  return state;
};

const updateLuTemplate = (state, { response }) => {
  state.luFiles = response.data.luFiles;
  return state;
};

const updateProjFile = (state, { response }) => {
  state.botProjFile = response.data.botFile;
  return state;
};

const setBotStatus = (state, { status }) => {
  return (state.botStatus = status);
};

const getStoragesSuccess = (state, { response }) => {
  return (state.storages = response.data);
};

const getStorageFileSuccess = (state, { response }) => {
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

const setStorageFileFetchingStatus = (state, { status }) => {
  state.storageFileLoadingStatus = status;
  return state;
};

const navigateTo = (state, { path }) => {
  if (state.navPath !== path) {
    state.navPath = path;
    state.focusPath = state.navPath; // fire up form editor on non-leaf node

    state.navPathHistory.push(path);
  }

  if (state.focusPath !== path) {
    state.focusPath = path;
  }
  return state;
};

const navigateDown = (state, { subPath }) => {
  state.navPath = state.navPath + subPath;
  state.focusPath = state.navPath; // fire up form editor on non-leaf node
  state.navPathHistory.push(state.navPath);
  return state;
};

const focusTo = (state, { path }) => {
  state.focusPath = path;
  return state.focusPath;
};

const clearNavHistory = (state, { fromIndex }) => {
  const length = state.navPathHistory.length;
  if (typeof fromIndex === 'undefined') {
    state.navPath = '';
    state.focusPath = '';
    state.navPathHistory.splice(0, length);
  } else if (fromIndex + 1 !== state.navPathHistory.length) {
    state.navPathHistory.splice(fromIndex, length);
  }

  return state;
};

const setBotLoadErrorMsg = (state, { error }) => {
  return (state.botLoadErrorMsg = error);
};

const setCreationFlowStatus = (state, { creationFlowStatus }) => {
  return (state.creationFlowStatus = creationFlowStatus);
};

const saveTemplateId = (state, { templateId }) => {
  return (state.templateId = templateId);
};

export const reducer = createReducer({
  [ActionTypes.GET_PROJECT_SUCCESS]: getProjectSuccess,
  [ActionTypes.CREATE_DIALOG_SUCCESS]: createDialogSuccess,
  [ActionTypes.UPDATE_DIALOG]: updateDialog,
  [ActionTypes.SET_BOT_STATUS_SUCCESS]: setBotStatus,
  [ActionTypes.GET_STORAGE_SUCCESS]: getStoragesSuccess,
  [ActionTypes.SET_STORAGEFILE_FETCHING_STATUS]: setStorageFileFetchingStatus,
  [ActionTypes.GET_STORAGEFILE_SUCCESS]: getStorageFileSuccess,
  [ActionTypes.SET_CREATION_FLOW_STATUS]: setCreationFlowStatus,
  [ActionTypes.UPDATE_PROJFILE__SUCCESS]: updateProjFile,
  [ActionTypes.SAVE_TEMPLATE_ID]: saveTemplateId,
  [ActionTypes.NAVIGATE_TO]: navigateTo,
  [ActionTypes.NAVIGATE_DOWN]: navigateDown,
  [ActionTypes.FOCUS_TO]: focusTo,
  [ActionTypes.CLEAR_NAV_HISTORY]: clearNavHistory,
  [ActionTypes.UPDATE_LG_SUCCESS]: updateLgTemplate,
  [ActionTypes.CREATE_LG_SUCCCESS]: updateLgTemplate,
  [ActionTypes.REMOVE_LG_SUCCCESS]: updateLgTemplate,
  [ActionTypes.UPDATE_LU_SUCCESS]: updateLuTemplate,
  [ActionTypes.CREATE_LU_SUCCCESS]: updateLuTemplate,
  [ActionTypes.REMOVE_LU_SUCCCESS]: updateLuTemplate,
  [ActionTypes.CONNECT_BOT_SUCCESS]: setBotStatus,
  [ActionTypes.CONNECT_BOT_FAILURE]: setBotStatus,
  [ActionTypes.RELOAD_BOT_FAILURE]: setBotLoadErrorMsg,
  [ActionTypes.RELOAD_BOT_SUCCESS]: setBotLoadErrorMsg,
});
