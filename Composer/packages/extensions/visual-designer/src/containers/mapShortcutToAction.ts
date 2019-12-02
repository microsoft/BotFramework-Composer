// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { KeyboardCommandTypes, KeyboardPrimaryTypes } from '../constants/KeyboardCommandTypes';
import { NodeEventTypes } from '../constants/NodeEventTypes';

import mapEditorEventToAction from './mapEditorEventToAction';

function mapShortcutToEditorEvent({ area, command }): { eventName: string; eventData?: any } | undefined {
  switch (area) {
    case KeyboardPrimaryTypes.Node:
      switch (command) {
        case KeyboardCommandTypes.Node.Delete:
          return { eventName: NodeEventTypes.DeleteSelection };
        case KeyboardCommandTypes.Node.Copy:
          return { eventName: NodeEventTypes.CopySelection };
        case KeyboardCommandTypes.Node.Cut:
          return { eventName: NodeEventTypes.CutSelection };
        case KeyboardCommandTypes.Node.Paste:
          return { eventName: NodeEventTypes.AppendSelection };
      }
      break;
    case KeyboardPrimaryTypes.Cursor: {
      return { eventName: NodeEventTypes.Navigation, eventData: command };
    }
    case KeyboardPrimaryTypes.Operation: {
      switch (command) {
        case KeyboardCommandTypes.Operation.Undo:
          return { eventName: NodeEventTypes.Undo };
        case KeyboardCommandTypes.Operation.Redo:
          return { eventName: NodeEventTypes.Redo };
      }
      break;
    }
    default:
      break;
  }
}

export default function mapShortcutToAction(shortcut, store) {
  const editorEvent = mapShortcutToEditorEvent(shortcut);
  if (editorEvent) {
    return mapEditorEventToAction(editorEvent.eventName, editorEvent.eventData, store);
  }
  return { type: '' };
}
