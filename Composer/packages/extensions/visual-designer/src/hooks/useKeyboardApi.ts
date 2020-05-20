// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DialogUtils } from '@bfc/shared';
import { useContext } from 'react';

import { KeyboardPrimaryTypes, KeyboardCommandTypes } from '../constants/KeyboardCommandTypes';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { MenuEventTypes, MenuTypes } from '../constants/MenuTypes';
import { moveCursor } from '../utils/cursorTracker';
import { SelectionContext } from '../store/SelectionContext';
import { NodeRendererContext } from '../store/NodeRendererContext';

export const useKeyboardApi = dispatchEvent => {
  const { focusedEvent, focusedId } = useContext(NodeRendererContext);
  const { selectedIds, selectableElements } = useContext(SelectionContext);

  const handleKeyboardCommand = ({ area, command }) => {
    switch (area) {
      case KeyboardPrimaryTypes.Node:
        switch (command) {
          case KeyboardCommandTypes.Node.Delete:
            dispatchEvent(NodeEventTypes.DeleteSelection);
            break;
          case KeyboardCommandTypes.Node.Copy:
            dispatchEvent(NodeEventTypes.CopySelection);
            break;
          case KeyboardCommandTypes.Node.Cut:
            dispatchEvent(NodeEventTypes.CutSelection);
            break;
          case KeyboardCommandTypes.Node.Paste: {
            const currentSelectedId = selectedIds[0];
            if (currentSelectedId.endsWith('+')) {
              const { arrayPath, arrayIndex } = DialogUtils.parseNodePath(currentSelectedId.slice(0, -1)) || {};
              dispatchEvent(NodeEventTypes.Insert, {
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
        dispatchEvent(NodeEventTypes.MoveCursor, cursor);
        break;
      }
      case KeyboardPrimaryTypes.Operation: {
        switch (command) {
          case KeyboardCommandTypes.Operation.Undo:
            dispatchEvent(NodeEventTypes.Undo, {});
            break;
          case KeyboardCommandTypes.Operation.Redo:
            dispatchEvent(NodeEventTypes.Redo, {});
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
