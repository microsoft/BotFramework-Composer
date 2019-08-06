import { ActionCreator } from '../types';

import { ActionTypes } from './../../constants';

export const setError: ActionCreator = ({ dispatch }, error) => {
  dispatch({
    type: ActionTypes.SET_ERROR,
    payload: error,
  });
};
