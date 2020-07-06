/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';

import { clipboardActionsState, visualEditorSelectionState } from '../atoms/appState';

export const editorDispatcher = () => {
  const setVisualEditorClipboard = useRecoilCallback(({ set }: CallbackInterface) => (clipboardActions: any[]) => {
    set(clipboardActionsState, [...clipboardActions]);
  });

  const setVisualEditorSelection = useRecoilCallback(({ set }: CallbackInterface) => (selection: string[]) => {
    set(visualEditorSelectionState, [...selection]);
  });

  const resetVisualEditor = useRecoilCallback(({ reset }: CallbackInterface) => () => {
    reset(visualEditorSelectionState);
  });

  return {
    setVisualEditorClipboard,
    resetVisualEditor,
    setVisualEditorSelection,
  };
};
