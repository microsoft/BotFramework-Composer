// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { KeyboardPrimaryTypes, KeyboardCommandTypes } from '../constants/KeyboardCommandTypes';
import { NodeEventTypes } from '../constants/NodeEventTypes';

import { useEditorEventApi } from './useEditorEventApi';

export const useKeyboardApi = () => {
  const { handleEditorEvent } = useEditorEventApi();

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
            handleEditorEvent(NodeEventTypes.PasteSelection);
            break;
          }
        }
        break;
      case KeyboardPrimaryTypes.Cursor: {
        handleEditorEvent(NodeEventTypes.MoveCursor, { command });
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
