// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License

import get from 'lodash/get';

import { NodeEventTypes } from '../components/nodes';
import { EditorAction } from '../actions/types/EditorAction';
import setFocusState from '../actions/setFocusState';
import navigateToDialog from '../actions/navigateToDialog';

export default function mapNodeEventToEditorAction(
  nodeId: string,
  eventName: NodeEventTypes,
  eventData?: any
): EditorAction | undefined {
  switch (eventName) {
    case NodeEventTypes.ClickNode:
      return setFocusState(nodeId, get(eventData, 'part'));
    case NodeEventTypes.ClickHyperlink:
      return navigateToDialog(get(eventData, 'target'));
  }
  return;
}
