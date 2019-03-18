import { Map, List } from 'immutable';

import createReducer from './createReducer';
import { ActionTypes } from './../../constants/index';

const defaultState = Map({
  files: List(),
});

const getFilesSuccess = (state, action) => {
  return state.set('files', List(action.payload.data));
};

export const filesStorage = createReducer(defaultState, {
  [ActionTypes.FILES_GET_SUCCESS]: getFilesSuccess,
});
