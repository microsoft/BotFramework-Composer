// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import { NodeEventTypes } from '../constants/NodeEventTypes';
import setFocusState from '../actions/setFocusState';
import setEventPath from '../actions/setEventPath';
import setDragSelection from '../actions/setDragSelection';

export default function mapEditorEventToAction(eventName, e, store) {
  switch (eventName) {
    case NodeEventTypes.Focus:
      return setFocusState(e.id, e.type);
    case NodeEventTypes.FocusEvent:
      return setEventPath(e);
    case NodeEventTypes.Select:
      return setDragSelection(e);
  }
  return null;
}
