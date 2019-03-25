import createReducer from './createReducer';
import { ActionTypes } from './../../constants/index';
const pattern = /\.{1}[a-zA-Z]{1,}$/;
const projectFiles = ['.bot', '.botproj'];

const initProjectState = state => {
  state.openFileIndex = -1;
  state.editors = [];
  return state;
};

const getFilesSuccess = (state, { response }) => {
  state.files = response.data.reduce((files, value) => {
    const extension = pattern.exec(value.name)[0];
    if (projectFiles.indexOf(extension) === -1) {
      files.push({ id: files.length, ...value });
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
    if (file.type === 'folder') {
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

export const reducer = createReducer({
  [ActionTypes.PROJECT_STATE_INIT]: initProjectState,
  [ActionTypes.FILES_GET_SUCCESS]: getFilesSuccess,
  [ActionTypes.FILES_UPDATE]: updateFiles,
  [ActionTypes.BOT_STATUS_SET]: setBotStatus,
  [ActionTypes.OPEN_FILE_INDEX_SET]: setOpenFileIndex,
  [ActionTypes.EDITOR_ADD]: addEditor,
  [ActionTypes.EDITOR_SET]: setEditor,
  [ActionTypes.STORAGEEXPLORER_STATUS_SET]: setStorageExplorerStatus,
  [ActionTypes.STORAGE_GET_SUCCESS]: getStoragesSuccess,
  [ActionTypes.STORAGEFILE_GET_SUCCESS]: getStorageFileSuccess,
});
