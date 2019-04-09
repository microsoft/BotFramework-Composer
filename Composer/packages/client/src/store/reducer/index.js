import findLastIndex from 'lodash.findlastindex';

import createReducer from './createReducer';
import { getBaseName, getExtension } from './../../utils';
import { ActionTypes, FileTypes } from './../../constants/index';

const projectFiles = ['bot', 'botproj'];

const closeCurrentProject = state => {
  state.openedDialogIndex = -1;
  state.editors = [];
  return state;
};

const getFilesSuccess = (state, { response }) => {
  const data = response.data;
  state.luFiles = data.luFiles || [];
  state.lgFiles = data.lgFiles || [];
  state.botProjFile = data.botFiles ? data.botFiles[0] : {};
  state.dialogFiles = data.dialogFiles
    ? data.dialogFiles.reduce((files, value) => {
        files.push({ id: files.length, ...value });
        return files;
      }, [])
    : [];
  state.path = data.path;
  return state;
};

const updateDialog = (state, payload) => {
  state.dialogFiles = state.dialogFiles.map((file, index) => {
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

const setOpenedDialogIndex = (state, { index }) => {
  return (state.openedDialogIndex = index);
};

const getStoragesSuccess = (state, { response }) => {
  return (state.storages = response.data);
};

const setStorageExplorerStatus = (state, { status }) => {
  return (state.storageExplorerStatus = status);
};

const getStorageFileSuccess = (state, { response }) => {
  state.currentStorageFiles = response.data.children.reduce((files, file) => {
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
    const currentopenedDialogIndex = state.dialogFiles.findIndex(file => {
      return getBaseName(file.name) === state.navPathHistory[lastDialogIndex];
    });
    state.openedDialogIndex = currentopenedDialogIndex;
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
  [ActionTypes.UPDATE_DIALOG]: updateDialog,
  [ActionTypes.BOT_STATUS_SET]: setBotStatus,
  [ActionTypes.SET_OPENED_FILE_INDEX]: setOpenedDialogIndex,
  [ActionTypes.STORAGEEXPLORER_STATUS_SET]: setStorageExplorerStatus,
  [ActionTypes.STORAGE_GET_SUCCESS]: getStoragesSuccess,
  [ActionTypes.STORAGEFILE_GET_SUCCESS]: getStorageFileSuccess,
  [ActionTypes.PROJ_FILE_UPDATE_SUCCESS]: updateProjFile,
  [ActionTypes.NAVIGATE_TO]: navigateTo,
  [ActionTypes.NAVIGATE_DOWN]: navigateDown,
  [ActionTypes.FOCUS_TO]: focusTo,
  [ActionTypes.CLEAR_NAV_HISTORY]: clearNavHistory,
});
