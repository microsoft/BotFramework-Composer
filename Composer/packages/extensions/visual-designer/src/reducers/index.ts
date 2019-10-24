import cloneDeep from 'lodash.clonedeep';

import { SET_CLIPBOARD } from '../actions/setClipboard';
import { SET_SELECTION } from '../actions/setSelection';

const globalReducer = (state, { type, payload }) => {
  switch (type) {
    case SET_CLIPBOARD:
      return {
        ...state,
        clipboardActions: cloneDeep(payload),
      };
    case SET_SELECTION:
      return {
        ...state,
        selectedIds: cloneDeep(payload),
      };
    default:
      return state;
  }
};

export default globalReducer;
