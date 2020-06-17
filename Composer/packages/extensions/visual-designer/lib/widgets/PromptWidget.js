// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo } from 'react';
import { PromptTab } from '@bfc/shared';
import { baseInputLayouter } from '../layouters/baseInputLayouter';
import { transformBaseInput } from '../transformers/transformBaseInput';
import { GraphNode } from '../models/GraphNode';
import { OffsetContainer } from '../components/lib/OffsetContainer';
import { ElementWrapper } from '../components/renderers/ElementWrapper';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { IconBrick } from '../components/decorations/IconBrick';
import { SVGContainer } from '../components/lib/SVGContainer';
import { ElementMeasurer } from '../components/renderers/ElementMeasurer';
import { useSmartLayout } from '../hooks/useSmartLayout';
import { designerCache } from '../store/DesignerCache';
import { FlowEdges } from '../components/lib/FlowEdges';
var PromptNodes;
(function (PromptNodes) {
  PromptNodes['BotAsks'] = 'botAsksNode';
  PromptNodes['UserAnswers'] = 'userAnswersNode';
  PromptNodes['InvalidPrompt'] = 'invalidPromptyNode';
})(PromptNodes || (PromptNodes = {}));
var calculateNodes = function (jsonpath, data) {
  var _a;
  var _b = transformBaseInput(data, jsonpath),
    botAsks = _b.botAsks,
    userAnswers = _b.userAnswers,
    invalidPrompt = _b.invalidPrompt;
  return (
    (_a = {}),
    (_a[PromptNodes.BotAsks] = GraphNode.fromIndexedJson(botAsks)),
    (_a[PromptNodes.UserAnswers] = GraphNode.fromIndexedJson(userAnswers)),
    (_a[PromptNodes.InvalidPrompt] = GraphNode.fromIndexedJson(invalidPrompt)),
    _a
  );
};
var calculateLayout = function (nodeMap) {
  var botAsksNode = nodeMap.botAsksNode,
    userAnswersNode = nodeMap.userAnswersNode,
    invalidPromptyNode = nodeMap.invalidPromptyNode;
  return baseInputLayouter(botAsksNode, userAnswersNode, invalidPromptyNode);
};
export var PromptWidget = function (_a) {
  var id = _a.id,
    data = _a.data,
    onEvent = _a.onEvent,
    onResize = _a.onResize,
    botAsks = _a.botAsks,
    userInput = _a.userInput;
  var nodes = useMemo(
    function () {
      return calculateNodes(id, data);
    },
    [id, data]
  );
  var _b = useSmartLayout(nodes, calculateLayout, onResize),
    layout = _b.layout,
    updateNodeBoundary = _b.updateNodeBoundary;
  var boundary = layout.boundary,
    nodeMap = layout.nodeMap,
    edges = layout.edges;
  var botAsksNode = nodeMap.botAsksNode,
    userAnswersNode = nodeMap.userAnswersNode,
    brickNode = nodeMap.invalidPromptNode;
  return jsx(
    'div',
    { className: 'Action-BaseInput', css: { width: boundary.width, height: boundary.height, position: 'relative' } },
    jsx(SVGContainer, { height: boundary.height, width: boundary.width }, jsx(FlowEdges, { edges: edges })),
    jsx(
      OffsetContainer,
      { offset: botAsksNode.offset },
      jsx(
        ElementWrapper,
        { id: botAsksNode.id, tab: PromptTab.BOT_ASKS, onEvent: onEvent },
        jsx(
          ElementMeasurer,
          {
            onResize: function (boundary) {
              designerCache.cacheBoundary(botAsksNode.data, boundary);
              updateNodeBoundary(PromptNodes.BotAsks, boundary);
            },
          },
          botAsks
        )
      )
    ),
    jsx(
      OffsetContainer,
      { offset: userAnswersNode.offset },
      jsx(
        ElementWrapper,
        { titleInHeader: true, id: userAnswersNode.id, tab: PromptTab.USER_INPUT, onEvent: onEvent },
        jsx(
          ElementMeasurer,
          {
            onResize: function (boundary) {
              designerCache.cacheBoundary(userAnswersNode.data, boundary);
              updateNodeBoundary(PromptNodes.UserAnswers, boundary);
            },
          },
          userInput
        )
      )
    ),
    jsx(
      OffsetContainer,
      { offset: brickNode.offset },
      jsx(
        ElementWrapper,
        { id: brickNode.id, tab: PromptTab.OTHER, onEvent: onEvent },
        jsx(IconBrick, {
          onClick: function () {
            return onEvent(NodeEventTypes.Focus, { id: id, tab: PromptTab.OTHER });
          },
        })
      )
    )
  );
};
//# sourceMappingURL=PromptWidget.js.map
