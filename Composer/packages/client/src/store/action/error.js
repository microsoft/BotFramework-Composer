import { ActionTypes } from './../../constants/index';

export function setErrorMsg(dispatch, errorMsg) {
  dispatch({
    type: ActionTypes.SET_ERROR_MESSAGE,
    payload: { errorMsg },
  });
}
