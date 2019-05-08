import createReducer from './createReducer';
import { getExtension } from './../../utils';
import { ActionTypes, FileTypes } from './../../constants/index';

const projectFiles = ['bot', 'botproj'];

const closeCurrentProject = state => {
  state.editors = [];
  return state;
};

const getProjectSuccess = (state, { response }) => {
  state.dialogs = response.data.dialogs;
  state.botProjFile = response.data.botFile;
  state.lgFiles = response.data.lgFiles;
  return state;
};

const updateDialog = (state, { response }) => {
  state.dialogs = response.data.dialogs;
  return state;
};

const createDialogSuccess = (state, { response }) => {
  state.dialogs = response.data.dialogs;
  return state;
};

const updateLgTemplate = (state, { response }) => {
  state.lgFiles = response.data.lgFiles;
  return state;
};

const updateLgTemplateState = (state, { id, lgTemplates }) => {
  state.lgFiles.find(file => file.id === id).templates = lgTemplates;
  state.lgFiles = state.lgFiles.slice();
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

const setStorageExplorerStatus = (state, { status }) => {
  return (state.storageExplorerStatus = status);
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

const setStorageFileFetchingStatus = (state, { status }, error) => {
  state.storageFileLoadingStatus = status;
  if (status === 'failure') {
    state = collectErrors(state, null, error);
  }
  return state;
};

const collectErrors = (state, payload, error) => {
  // does error have same structure?
  console.log(error.response);
  state.errorMessages.unshift({
    Message: error.response.data,
    status: error.response.status,
  });
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
  if (state.navPath.endsWith('#')) {
    state.navPath = state.navPath + subPath.substring(1);
  } else {
    state.navPath = state.navPath + subPath;
  }
  state.focusPath = state.navPath; // fire up form editor on non-leaf node
  state.navPathHistory.push(state.navPath);
  return state;
};

const focusTo = (state, { subPath }) => {
  if (state.focusPath !== state.navPath + subPath) {
    state.resetFormEditor = true;
  }
  if (state.navPath.endsWith('#')) {
    state.focusPath = state.navPath + subPath.substring(1);
  } else {
    state.focusPath = state.navPath + subPath;
  }
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

export const reducer = createReducer({
  [ActionTypes.PROJECT_STATE_INIT]: closeCurrentProject,
  [ActionTypes.GET_PROJECT_SUCCESS]: getProjectSuccess,
  [ActionTypes.GET_PROJECT_FAILURE]: collectErrors,
  [ActionTypes.CREATE_DIALOG_SUCCESS]: createDialogSuccess,
  [ActionTypes.UPDATE_DIALOG]: updateDialog,
  [ActionTypes.BOT_STATUS_SET]: setBotStatus,
  [ActionTypes.STORAGEEXPLORER_STATUS_SET]: setStorageExplorerStatus,
  [ActionTypes.STORAGE_GET_SUCCESS]: getStoragesSuccess,
  [ActionTypes.SET_STORAGEFILE_FETCHING_STATUS]: setStorageFileFetchingStatus,
  [ActionTypes.STORAGEFILE_GET_SUCCESS]: getStorageFileSuccess,
  [ActionTypes.PROJ_FILE_UPDATE_SUCCESS]: updateProjFile,
  [ActionTypes.NAVIGATE_TO]: navigateTo,
  [ActionTypes.NAVIGATE_DOWN]: navigateDown,
  [ActionTypes.FOCUS_TO]: focusTo,
  [ActionTypes.CLEAR_NAV_HISTORY]: clearNavHistory,
  [ActionTypes.UPDATE_LG_TEMPLATE]: updateLgTemplate,
  [ActionTypes.UPDATE_LG_TEMPLATE_STATE]: updateLgTemplateState,
});
