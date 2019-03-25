import createReducer from './createReducer';
import { ActionTypes } from './../../constants/index';

const getFilesSuccess = (state, { response }) => {
  const pattern = /\.{1}[a-zA-Z]{1,}$/;
  const invalidFile = ['.bot', '.botproj'];

  state.files = response.data.reduce((files, value) => {
    const extension = pattern.exec(value.name)[0];
    if (invalidFile.indexOf(extension) === -1) {
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
  return (state.currentStorageFiles = response.data);
};

const loadingStorageFiles = (state, { storage }) => {
  return (state.currentStorage = storage);
};

export const reducer = createReducer({
  [ActionTypes.FILES_GET_SUCCESS]: getFilesSuccess,
  [ActionTypes.FILES_UPDATE]: updateFiles,
  [ActionTypes.BOT_STATUS_SET]: setBotStatus,
  [ActionTypes.OPEN_FILE_INDEX_SET]: setOpenFileIndex,
  [ActionTypes.EDITOR_ADD]: addEditor,
  [ActionTypes.EDITOR_SET]: setEditor,
  [ActionTypes.STORAGEEXPLORER_STATUS_SET]: setStorageExplorerStatus,
  [ActionTypes.STORAGE_GET_SUCCESS]: getStoragesSuccess,
  [ActionTypes.STORAGEFILE_GET_SUCCESS]: getStorageFileSuccess,
  [ActionTypes.STORAGEFILE_LOADING]: loadingStorageFiles,
});
