import { ActionTypes } from './../../constants/index';

export function addEditor(dispatch, editor) {
  dispatch({
    type: ActionTypes.EDITOR_ADD,
    editor,
  });
}
