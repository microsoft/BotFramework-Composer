// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { NodeEventTypes } from '../constants/NodeEventTypes';
import setFocusState from '../actions/setFocusState';
import setEventPath from '../actions/setEventPath';
import gotoDialog from '../actions/gotoDialog';
import {
  createNode,
  createEvent,
  pasteNodes,
  copyNodes,
  cutNodes,
  deleteNode,
  deleteNodes,
  appendNodes,
} from '../actions/nodeOperations';
import { undo, redo } from '../actions/undoRedo';

export default function mapEditorEventToAction(eventName, e, store) {
  switch (eventName) {
    case NodeEventTypes.Focus:
      return setFocusState(e.id, e.type);
    case NodeEventTypes.FocusEvent:
      return setEventPath(e);
    case NodeEventTypes.OpenDialog:
      return gotoDialog(e);
    case NodeEventTypes.Delete:
      return deleteNode(e.id);
    case NodeEventTypes.Insert:
      if (e.$type === 'PASTE') {
        return pasteNodes(e.id, e.position);
      } else {
        return createNode(e.id, e.position, e.$type);
      }
    case NodeEventTypes.InsertEvent:
      return createEvent(e.position, e.$type);
    case NodeEventTypes.CopySelection:
      return copyNodes(store.selectedNodes);
    case NodeEventTypes.CutSelection:
      return cutNodes(store.selectedNodes);
    case NodeEventTypes.DeleteSelection:
      return deleteNodes(store.selectedNodes);
    case NodeEventTypes.AppendSelection:
      return appendNodes(store.focusedId, store.clipboardActions);
    case NodeEventTypes.Undo:
      return undo();
    case NodeEventTypes.Redo:
      return redo();
  }
  return { type: eventName, payload: e };
}
