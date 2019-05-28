import { ActionTypes } from './../../constants/index';

export function resetVisualEditor(dispatch, isReset) {
  dispatch({
    type: ActionTypes.EDITOR_RESET_VISUAL,
    payload: { isReset },
  });
}
