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

const addEditor = (state, { editor }) => {
  state.editors.push(editor);
  return state;
};

const setEditor = (state, { editor }) => {
  state.editors = [editor];
  return state;
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

const resetVisualEditor = (state, { isReset }) => {
  return (state.resetVisualEditor = isReset);
};

const resetFormEditor = (state, { isReset }) => {
  return (state.resetFormEditor = isReset);
};

const navigateTo = (state, { path }) => {
  if (state.navPath !== '' && state.navPath !== path) {
    state.resetVisualEditor = true;
    state.focusPath = ''; // close form editor since it's not correct
  }
  state.navPath = path;
  return state;
};

const navigateDown = (state, { subPath }) => {
  return (state.navPath = state.navPath + subPath);
};

const focusTo = (state, { subPath }) => {
  if (state.focusPath !== '' && state.focusPath !== state.navPath + subPath) {
    state.resetFormEditor = true;
  }
  return (state.focusPath = state.navPath + subPath);
};

export const reducer = createReducer({
  [ActionTypes.PROJECT_STATE_INIT]: closeCurrentProject,
  [ActionTypes.FILES_GET_SUCCESS]: getFilesSuccess,
  [ActionTypes.FILES_UPDATE]: updateFiles,
  [ActionTypes.BOT_STATUS_SET]: setBotStatus,
  [ActionTypes.OPEN_FILE_INDEX_SET]: setOpenFileIndex,
  [ActionTypes.EDITOR_ADD]: addEditor,
  [ActionTypes.EDITOR_SET]: setEditor,
  [ActionTypes.STORAGEEXPLORER_STATUS_SET]: setStorageExplorerStatus,
  [ActionTypes.STORAGE_GET_SUCCESS]: getStoragesSuccess,
  [ActionTypes.STORAGEFILE_GET_SUCCESS]: getStorageFileSuccess,
  [ActionTypes.EDITOR_RESET_VISUAL]: resetVisualEditor,
  [ActionTypes.PROJ_FILE_UPDATE_SUCCESS]: updateProjFile,
  [ActionTypes.EDITOR_RESET_FORM]: resetFormEditor,
  [ActionTypes.NAVIGATE_TO]: navigateTo,
  [ActionTypes.NAVIGATE_DOWN]: navigateDown,
  [ActionTypes.FOCUS_TO]: focusTo,
});
