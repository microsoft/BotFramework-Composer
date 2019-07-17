import { ActionTypes } from './../../constants/index';

export function cleanError(dispatch, { name }) {
  dispatch({
    type: ActionTypes.CLEAN_ERROR,
    payload: { name },
  });
}
