import findLastIndex from 'lodash.findlastindex';

import createReducer from './createReducer';
import { getBaseName, getExtension } from './../../utils';
import { ActionTypes, FileTypes } from './../../constants/index';

const projectFiles = ['bot', 'botproj'];
const dialogFiles = ['dialog'];

const closeCurrentProject = state => {
  state.openFileIndex = -1;
  state.editors = [];
  return state;
};

const getFilesSuccess = (state, { response }) => {
  state.files = response.data.projectFiles.reduce((files, value) => {
    const extension = getExtension(value.name);
    if (projectFiles.indexOf(extension) >= 0) {
      state.botProjFile = value;
    } else if (dialogFiles.indexOf(extension) >= 0) {
      files.push({ id: files.length, ...value });
    }
    return files;
  }, []);
  state.path = response.data.path;
  return state;
};

const updateFiles = (state, payload) => {
  state.files = state.files.map((file, index) => {
    if (file.name === payload.name) return { ...file, id: index, ...payload };
    return file;
  });
  return state;
};

const updateProjFile = (state, payload) => {
  state.botProjFile = payload;
  return state;
};

const setBotStatus = (state, { status }) => {
  return (state.botStatus = status);
};

const setOpenFileIndex = (state, { index }) => {
  return (state.openFileIndex = index);
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
  state.focusedStorageFolder = focusedStorageFolder;
  return state;
};

const navigateTo = (state, { path }) => {
  if (state.navPath !== path) {
    state.navPath = path;
    state.focusPath = state.navPath; // fire up form editor on non-leaf node

    state.navPathHistory.push(path);

    // update file index if we are switching to new dialog
    const lastDialogIndex = findLastIndex(state.navPathHistory, path => {
      return getBaseName(path) === path;
    });
    const currentOpenFileIndex = state.files.findIndex(file => {
      return getBaseName(file.name) === state.navPathHistory[lastDialogIndex];
    });
    state.openFileIndex = currentOpenFileIndex;
  }
  return state;
};

const navigateDown = (state, { subPath }) => {
  state.navPath = state.navPath + subPath;
  state.focusPath = state.navPath; // fire up form editor on non-leaf node
  state.navPathHistory.push(state.navPath);
  return state;
};

const focusTo = (state, { subPath }) => {
  if (state.focusPath !== state.navPath + subPath) {
    state.resetFormEditor = true;
  }
  return (state.focusPath = state.navPath + subPath);
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
  [ActionTypes.FILES_GET_SUCCESS]: getFilesSuccess,
  [ActionTypes.FILES_UPDATE]: updateFiles,
  [ActionTypes.BOT_STATUS_SET]: setBotStatus,
  [ActionTypes.OPEN_FILE_INDEX_SET]: setOpenFileIndex,
  [ActionTypes.STORAGEEXPLORER_STATUS_SET]: setStorageExplorerStatus,
  [ActionTypes.STORAGE_GET_SUCCESS]: getStoragesSuccess,
  [ActionTypes.STORAGEFILE_GET_SUCCESS]: getStorageFileSuccess,
  [ActionTypes.PROJ_FILE_UPDATE_SUCCESS]: updateProjFile,
  [ActionTypes.NAVIGATE_TO]: navigateTo,
  [ActionTypes.NAVIGATE_DOWN]: navigateDown,
  [ActionTypes.FOCUS_TO]: focusTo,
  [ActionTypes.CLEAR_NAV_HISTORY]: clearNavHistory,
});
