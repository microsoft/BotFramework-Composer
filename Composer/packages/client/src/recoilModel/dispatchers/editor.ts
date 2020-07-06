/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface } from 'recoil';

import { clipboardActionsState, visualEditorSelectionState } from '../atoms/appState';

export const editorDispatcher = {
  setVisualEditorClipboard: ({ set }: CallbackInterface) => (clipboardActions: any[]) => {
    set(clipboardActionsState, [...clipboardActions]);
  },

  setVisualEditorSelection: ({ set }: CallbackInterface) => (selection: string[]) => {
    set(visualEditorSelectionState, [...selection]);
  },

  resetVisualEditor: ({ reset }: CallbackInterface) => () => {
    reset(visualEditorSelectionState);
  },
};
