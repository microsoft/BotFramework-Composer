// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogUtils } from '@bfc/shared';
import { useContext } from 'react';

import { KeyboardPrimaryTypes, KeyboardCommandTypes } from '../constants/KeyboardCommandTypes';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { MenuEventTypes, MenuTypes } from '../constants/MenuTypes';
import { moveCursor } from '../utils/cursorTracker';
import { NodeRendererContext } from '../store/NodeRendererContext';

import { useSelectionApi } from './useSelectionApi';
import { useEditorEventHandler } from './useEditorEventHandler';

export const useKeyboardApi = () => {
  const { focusedEvent, focusedId } = useContext(NodeRendererContext);
  const { handleEditorEvent } = useEditorEventHandler();
  const { selectedIds, selectableElements } = useSelectionApi();

  const handleKeyboardCommand = ({ area, command }) => {
    switch (area) {
      case KeyboardPrimaryTypes.Node:
        switch (command) {
          case KeyboardCommandTypes.Node.Delete:
            handleEditorEvent(NodeEventTypes.DeleteSelection);
            break;
          case KeyboardCommandTypes.Node.Copy:
            handleEditorEvent(NodeEventTypes.CopySelection);
            break;
          case KeyboardCommandTypes.Node.Cut:
            handleEditorEvent(NodeEventTypes.CutSelection);
            break;
          case KeyboardCommandTypes.Node.Paste: {
            const currentSelectedId = selectedIds[0];
            if (currentSelectedId.endsWith('+')) {
              const { arrayPath, arrayIndex } = DialogUtils.parseNodePath(currentSelectedId.slice(0, -1)) || {};
              handleEditorEvent(NodeEventTypes.Insert, {
                id: arrayPath,
                position: arrayIndex,
                $kind: MenuEventTypes.Paste,
              });
            }
            break;
          }
        }
        break;
      case KeyboardPrimaryTypes.Cursor: {
        const currentSelectedId = selectedIds[0] || focusedId || '';
        const cursor = currentSelectedId
          ? moveCursor(selectableElements, currentSelectedId, command)
          : {
              selected: `${focusedEvent}.actions[0]${MenuTypes.EdgeMenu}`,
              focused: undefined,
              tab: '',
            };
        handleEditorEvent(NodeEventTypes.MoveCursor, cursor);
        break;
      }
      case KeyboardPrimaryTypes.Operation: {
        switch (command) {
          case KeyboardCommandTypes.Operation.Undo:
            handleEditorEvent(NodeEventTypes.Undo, {});
            break;
          case KeyboardCommandTypes.Operation.Redo:
            handleEditorEvent(NodeEventTypes.Redo, {});
            break;
        }
        break;
      }
      default:
        break;
    }
  };
  return { handleKeyboardCommand };
};
