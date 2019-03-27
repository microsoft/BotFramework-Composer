import { ActionTypes } from './../../constants/index';

export function resetVisualEditor(dispatch, isReset) {
  dispatch({
    type: ActionTypes.EDITOR_RESET_VISUAL,
    payload: { isReset },
  });
}

export function resetFormEditor(dispatch, isReset) {
  dispatch({
    type: ActionTypes.EDITOR_RESET_FORM,
    payload: { isReset },
  });
}
