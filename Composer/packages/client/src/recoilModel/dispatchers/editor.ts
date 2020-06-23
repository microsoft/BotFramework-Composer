/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';

import { clipboardActionsState, visualEditorSelectionState } from '../atoms/appState';

export const editorDispatcher = () => {
  const setVisualEditorClipboard = useRecoilCallback<[[]], void>(
    ({ set }: CallbackInterface) => (clipboardActions: []) => {
      set(clipboardActionsState, [...clipboardActions]);
    }
  );

  const setVisualEditorSelection = useRecoilCallback<[string[]], void>(
    ({ set }: CallbackInterface) => (selection: string[]) => {
      set(visualEditorSelectionState, [...selection]);
    }
  );

  const resetVisualEditor = useRecoilCallback<[], void>(({ reset }: CallbackInterface) => () => {
    reset(visualEditorSelectionState);
  });

  return {
    setVisualEditorClipboard,
    resetVisualEditor,
    setVisualEditorSelection,
  };
};
