// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { KeyboardCommandTypes, KeyboardPrimaryTypes } from '../constants/KeyboardCommandTypes';
import { NodeEventTypes } from '../constants/NodeEventTypes';

export default function mapShortcutToEditorEvent({
  area,
  command,
}): { eventName: string; eventData?: any } | undefined {
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
