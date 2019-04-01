import createReducer from './createReducer';
import { ActionTypes, FileTypes } from './../../constants/index';
const pattern = /\.{1}[a-zA-Z]{1,}$/;
const projectFiles = ['.bot', '.botproj'];

const closeCurrentProject = state => {
  state.openFileIndex = -1;
  state.editors = [];
  return state;
};

const getFilesSuccess = (state, { response }) => {
  state.files = response.data.reduce((files, value) => {
    const extension = pattern.exec(value.name)[0];
    if (projectFiles.indexOf(extension) === -1) {
      files.push({ id: files.length, ...value });
    } else {
      state.botProjFile = value;
    }
    return files;
  }, []);
  return state;
};

const updateFiles = (state, payload) => {
  state.files = state.files.map((file, index) => {
    if (file.name === payload.name) return { id: index, ...payload };
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
  state.currentStorageFiles = response.data.children.reduce((files, file) => {
    if (file.type === FileTypes.FOLDER) {
      files.push(file);
    } else {
      const path = file.path;
      const extension = path.substring(path.lastIndexOf('.'), path.length);
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
    state.focusPath = '';
    state.navPathHistory.push(path);
  }
  return state;
};

const navigateDown = (state, { subPath }) => {
  state.navPath = state.navPath + subPath;
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
  [ActionTypes.NAV_HISTORY_CLEAR]: clearNavHistory,
});
