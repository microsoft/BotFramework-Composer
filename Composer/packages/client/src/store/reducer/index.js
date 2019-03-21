import createReducer from './createReducer';
import { ActionTypes } from './../../constants/index';

const getFilesSuccess = (state, { response }) => {
  return (state.files = response.data);
};

const updateFiles = (state, payload) => {
  state.files = state.files.map(file => {
    if (file.name === payload.name) return payload;
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

export const reducer = createReducer({
  [ActionTypes.FILES_GET_SUCCESS]: getFilesSuccess,
  [ActionTypes.FILES_UPDATE]: updateFiles,
  [ActionTypes.BOT_STATUS_SET]: setBotStatus,
  [ActionTypes.OPEN_FILE_INDEX_SET]: setOpenFileIndex,
  [ActionTypes.EDITOR_ADD]: addEditor,
  [ActionTypes.EDITOR_SET]: setEditor,
});
