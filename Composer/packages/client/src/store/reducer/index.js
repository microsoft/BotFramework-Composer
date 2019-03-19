import { List } from 'immutable';

import createReducer from './createReducer';
import { ActionTypes } from './../../constants/index';

const getFilesSuccess = (state, action) => {
  return state.set('files', List(action.payload.data));
};

const updateFiles = (state, action) => {
  return state.set('files', List(action.payload));
};

export const reducer = createReducer({
  [ActionTypes.FILES_GET_SUCCESS]: getFilesSuccess,
  [ActionTypes.FILES_UPDATE]: updateFiles,
});
