import createReducer from './createReducer';
import { getExtension } from './../../utils';
import { ActionTypes, FileTypes } from './../../constants/index';

const projectFiles = ['bot', 'botproj'];

const getProjectSuccess = (state, { response }) => {
  state.dialogs = response.data.dialogs;
  state.botName = response.data.botName;
  state.lgFiles = response.data.lgFiles;
  state.schemas = response.data.schemas;
  state.luFiles = response.data.luFiles;
  state.luStatus = response.data.luStatus;
  return state;
};

const getRecentProjectsSuccess = (state, { response }) => {
  state.recentProjects = response.data;
  return state;
};

const updateDialog = (state, { response }) => {
  state.dialogs = response.data.dialogs;
  return state;
};

const removeDialog = (state, { response }) => {
  state.dialogs = response.data.dialogs;
  state.luFiles = response.data.luFiles;
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

const setBotLoadErrorMsg = (state, { error }) => {
  return (state.botLoadErrorMsg = error);
};

const setCreationFlowStatus = (state, { creationFlowStatus }) => {
  return (state.creationFlowStatus = creationFlowStatus);
};

const saveTemplateId = (state, { templateId }) => {
  return (state.templateId = templateId);
};

const setError = (state, payload) => {
  return (state.error = payload);
};

const updateOAuth = (state, { oAuth }) => {
  return (state.oAuth = oAuth);
};

const setToStartBot = (state, { toStartBot }) => {
  return (state.toStartBot = toStartBot);
};

export const reducer = createReducer({
  [ActionTypes.GET_PROJECT_SUCCESS]: getProjectSuccess,
  [ActionTypes.GET_RECENT_PROJECTS_SUCCESS]: getRecentProjectsSuccess,
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
  [ActionTypes.REMOVE_LU_SUCCCESS]: updateLuTemplate,
  [ActionTypes.CONNECT_BOT_SUCCESS]: setBotStatus,
  [ActionTypes.CONNECT_BOT_FAILURE]: setBotStatus,
  [ActionTypes.RELOAD_BOT_FAILURE]: setBotLoadErrorMsg,
  [ActionTypes.RELOAD_BOT_SUCCESS]: setBotLoadErrorMsg,
  [ActionTypes.UPDATE_OAUTH]: updateOAuth,
  [ActionTypes.SET_ERROR]: setError,
  [ActionTypes.TO_START_BOT]: setToStartBot,
});
