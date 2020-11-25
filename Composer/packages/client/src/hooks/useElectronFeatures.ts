// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useRef } from 'react';
import get from 'lodash/get';
import { getEditorAPI } from '@bfc/shared';

export const useElectronFeatures = (actionSelected: boolean, canUndo: boolean, canRedo: boolean) => {
  const flowEditorFocused = useRef(false);

  const sendStatus = () => {
    if (!window.__IS_ELECTRON__) return;
    if (!window.ipcRenderer || typeof window.ipcRenderer.send !== 'function') return;
    window.ipcRenderer.send('composer-state-change', {
      actionSelected,
      flowFocused: flowEditorFocused.current,
      canUndo,
      canRedo,
    });
  };

  const onFocusFlowEditor = () => {
    flowEditorFocused.current = true;
    sendStatus();
  };

  const onBlurFlowEditor = () => {
    flowEditorFocused.current = false;
    sendStatus();
  };

  // Sync selection state to Electron main process
  useEffect(() => {
    sendStatus();
  }, [actionSelected, canUndo, canRedo]);

  // Subscribe Electron app menu events (copy/cut/del/undo/redo)
  useEffect(() => {
    if (!window.__IS_ELECTRON__) return;
    if (!window.ipcRenderer || typeof window.ipcRenderer.on !== 'function') return;

    const EditorAPI = getEditorAPI();
    window.ipcRenderer.on('electron-menu-clicked', (e, data) => {
      const label = get(data, 'label', '');
      switch (label) {
        case 'undo':
          return EditorAPI.Editing.Undo();
        case 'redo':
          return EditorAPI.Editing.Redo();
        case 'cut':
          return EditorAPI.Actions.CutSelection();
        case 'copy':
          return EditorAPI.Actions.CopySelection();
        case 'delete':
          return EditorAPI.Actions.DeleteSelection();
      }
    });
  }, []);

  return {
    onFocusFlowEditor,
    onBlurFlowEditor,
  };
};
