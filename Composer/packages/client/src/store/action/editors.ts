// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { CodeEditorSettings } from '@bfc/shared';

import { ActionCreator } from '../types';

import { ActionTypes } from './../../constants';

export const resetVisualEditor: ActionCreator = ({ dispatch }, isReset) => {
  dispatch({
    type: ActionTypes.EDITOR_RESET_VISUAL,
    payload: { isReset },
  });
};

export const setVisualEditorSelection: ActionCreator = ({ dispatch }, selection) => {
  dispatch({
    type: ActionTypes.EDITOR_SELECTION_VISUAL,
    payload: {
      selection,
    },
  });
};

export const setVisualEditorClipboard: ActionCreator = ({ dispatch }, clipboardActions) => {
  dispatch({
    type: ActionTypes.EDITOR_CLIPBOARD,
    payload: {
      clipboardActions,
    },
  });
};

export const setCodeEditorSettings: ActionCreator = ({ dispatch }, settings: Partial<CodeEditorSettings>) => {
  dispatch({
    type: ActionTypes.SET_CODE_EDITOR_SETTINGS,
    payload: settings,
  });
};
