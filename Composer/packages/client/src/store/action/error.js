import { ActionTypes } from './../../constants/index';

export function setError(dispatch, error) {
  dispatch({
    type: ActionTypes.SET_ERROR,
    payload: error,
  });
}
