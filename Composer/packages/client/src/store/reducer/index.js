import createReducer from './createReducer';
import { ActionTypes } from './../../constants/index';

const getFilesSuccess = (state, action) => {
  return (state.files = action.payload.data);
};

const updateFiles = (state, action) => {
  state.files = state.files.map(file => {
    if (file.name === action.payload.name) return action.payload;
    return file;
  });
  return state;
};

const setBotStatus = (state, action) => {
  return (state.botStatus = action.status);
};

const setOpenFileIndex = (state, action) => {
  return (state.openFileIndex = action.index);
};

const addEditor = (state, action) => {
  state.editors.push(action.editor);
  return state;
};

export const reducer = createReducer({
  [ActionTypes.FILES_GET_SUCCESS]: getFilesSuccess,
  [ActionTypes.FILES_UPDATE]: updateFiles,
  [ActionTypes.BOT_STATUS_SET]: setBotStatus,
  [ActionTypes.OPEN_FILE_INDEX_SET]: setOpenFileIndex,
  [ActionTypes.EDITOR_ADD]: addEditor,
});
