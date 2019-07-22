import { ActionTypes } from './../../constants/index';

export function setDesignPath(dispatch, { dialogId, navPath, focused, uri, navPathHistory }) {
  dispatch({
    type: ActionTypes.SET_DESIGN_PATH,
    payload: { dialogId, navPath, focused, uri, navPathHistory },
  });
}
