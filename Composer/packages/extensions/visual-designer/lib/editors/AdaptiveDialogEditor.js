// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useContext } from 'react';
import { DialogUtils } from '@bfc/shared';
import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { GraphNode } from '../models/GraphNode';
import { NodeRendererContext } from '../store/NodeRendererContext';
import { Collapse } from '../components/lib/Collapse';
import { EventsEditor } from './EventsEditor';
import { RuleEditor } from './RuleEditor';
import { defaultEditorProps } from './editorProps';
import { EditorConfig } from './editorConfig';
var queryNode = DialogUtils.queryNode;
var calculateNodeMap = function (_, data) {
  var result = transformRootDialog(data);
  if (!result) return {};
  var ruleGroup = result.ruleGroup,
    stepGroup = result.stepGroup;
  return {
    ruleGroup: GraphNode.fromIndexedJson(ruleGroup),
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};
export var AdaptiveDialogEditor = function (_a) {
  var id = _a.id,
    data = _a.data,
    onEvent = _a.onEvent;
  var nodeMap = useMemo(
    function () {
      return calculateNodeMap(id, data);
    },
    [id, data]
  );
  var ruleGroup = nodeMap.ruleGroup;
  var focusedEvent = useContext(NodeRendererContext).focusedEvent;
  var interceptRuleEvent = function (eventName, eventData) {
    if (eventName === NodeEventTypes.Expand) {
      var selectedRulePath = eventData;
      return onEvent(NodeEventTypes.FocusEvent, selectedRulePath);
    }
    if (eventName === NodeEventTypes.Insert) {
      return onEvent(NodeEventTypes.InsertEvent, eventData);
    }
    return onEvent(eventName, eventData);
  };
  var activeEventData = queryNode(data, focusedEvent);
  var eventActions = activeEventData
    ? jsx(RuleEditor, { key: focusedEvent, data: activeEventData, id: focusedEvent, onEvent: onEvent })
    : null;
  if (!EditorConfig.features.showEvents) {
    return eventActions;
  }
  return jsx(
    'div',
    {
      css: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      },
      onClick: function (e) {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, { id: '' });
      },
    },
    ruleGroup &&
      jsx(EventsEditor, { key: ruleGroup.id, data: ruleGroup.data, id: ruleGroup.id, onEvent: interceptRuleEvent }),
    jsx('div', { className: 'editor-interval', style: { height: 50 } }),
    jsx(Collapse, { text: 'Actions' }, eventActions)
  );
};
AdaptiveDialogEditor.defaultProps = defaultEditorProps;
//# sourceMappingURL=AdaptiveDialogEditor.js.map
