// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import cloneDeep from 'lodash/cloneDeep';

import { StoreState } from '../store/store';
import { CLEAR_SELECTIONSTATE } from '../actions/clearSelectionState';
import { SET_CLIPBOARD } from '../actions/setClipboard';
import { SET_DRAGSELECTION } from '../actions/setDragSelection';
import { SET_EVENTPATH } from '../actions/setEventPath';
import { SET_FOCUSSTATE } from '../actions/setFocusState';

const reducer = (state: StoreState, { type, payload }): StoreState => {
  switch (type) {
    case SET_EVENTPATH:
      return {
        ...state,
        eventPath: payload || '',
      };
    case SET_FOCUSSTATE:
      return {
        ...state,
        focusedId: payload.focusedId || '',
        eventPath: payload.focusedTab || '',
      };
    case SET_DRAGSELECTION:
      return {
        ...state,
        selectedIds: [...payload] || [],
      };
    case CLEAR_SELECTIONSTATE:
      return {
        ...state,
        selectedIds: [],
      };
    case SET_CLIPBOARD:
      return {
        ...state,
        clipboardActions: cloneDeep(payload) || [],
      };
  }
  return state;
};

export default reducer;
