import cloneDeep from 'lodash.clonedeep';

import { SET_CLIPBOARD } from '../actions/setClipboard';
import { SET_DRAGSELECTION } from '../actions/setDragSelection';
import { SET_FOCUSSTATE } from '../actions/setFocusState';
import { CLEAR_SELECTIONSTATE } from '../actions/clearSelectionState';
import { StoreState } from '../store/store';

const globalReducer = (state: StoreState, { type, payload }) => {
  switch (type) {
    case SET_CLIPBOARD:
      return {
        ...state,
        clipboardActions: cloneDeep(payload.actions) || [],
      };
    case SET_DRAGSELECTION:
      return {
        ...state,
        selectedIds: cloneDeep(payload.ids) || [],
      };
    case SET_FOCUSSTATE:
      return {
        ...state,
        focusedIds: cloneDeep(payload.ids) || [],
        selectedIds: [],
      };
    case CLEAR_SELECTIONSTATE:
      if (!state.focusedIds.length && !state.selectedIds.length) {
        return state;
      }
      return {
        ...state,
        focusedIds: [],
        selectedIds: [],
      };
    default:
      return state;
  }
};

export default globalReducer;
