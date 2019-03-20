import { ActionTypes } from './../../constants/index';

export function addEditor(editor, dispatch) {
  dispatch({
    type: ActionTypes.EDITOR_ADD,
    editor,
  });
}
