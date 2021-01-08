/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';
import { NodeEventTypes } from '@bfc/adaptive-flow';

import { clipboardActionsState, visualEditorExternalEventState, visualEditorSelectionState } from '../atoms/appState';
import { ActionKinds } from '../../components/Search/types';

export const editorDispatcher = () => {
  const setVisualEditorClipboard = useRecoilCallback(
    ({ set }: CallbackInterface) => (clipboardActions: any[], projectId: string) => {
      set(clipboardActionsState(projectId), [...clipboardActions]);
    }
  );

  const setVisualEditorSelection = useRecoilCallback(({ set }: CallbackInterface) => (selection: string[]) => {
    set(visualEditorSelectionState, [...selection]);
  });

  const resetVisualEditor = useRecoilCallback(({ reset }: CallbackInterface) => () => {
    reset(visualEditorSelectionState);
  });

  const setVisualEditorExternalEvent = useRecoilCallback(
    ({ set }: CallbackInterface) => (eventType?: NodeEventTypes, command?: string) => {
      set(visualEditorExternalEventState, { eventType, eventData: { kind: ActionKinds[command || ''], command } });
    }
  );

  return {
    setVisualEditorExternalEvent,
    setVisualEditorClipboard,
    resetVisualEditor,
    setVisualEditorSelection,
  };
};
