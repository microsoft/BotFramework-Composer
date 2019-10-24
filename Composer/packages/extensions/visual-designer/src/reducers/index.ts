import cloneDeep from 'lodash.clonedeep';

import { SET_CLIPBOARD } from '../actions/setClipboard';
import { SET_SELECTION } from '../actions/setSelection';
import { SET_FOCUSSTATE } from '../actions/setFocusState';

const globalReducer = (state, { type, payload }) => {
  switch (type) {
    case SET_CLIPBOARD:
      return {
        ...state,
        clipboardActions: cloneDeep(payload.actions) || [],
      };
    case SET_SELECTION:
      return {
        ...state,
        selectedIds: cloneDeep(payload.ids) || [],
      };
    case SET_FOCUSSTATE:
      return {
        ...state,
        focusedIds: cloneDeep(payload.ids) || [],
      };
    default:
      return state;
  }
};

export default globalReducer;
