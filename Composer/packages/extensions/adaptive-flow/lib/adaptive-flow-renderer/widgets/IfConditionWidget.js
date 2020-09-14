// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useContext } from 'react';
import { transformIfCondtion } from '../transformers/transformIfCondition';
import { ifElseLayouter } from '../layouters/ifelseLayouter';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { GraphNode } from '../models/GraphNode';
import { OffsetContainer } from '../components/OffsetContainer';
import { Diamond } from '../components/Diamond';
import { ElementMeasurer } from '../components/ElementMeasurer';
import { SVGContainer } from '../components/SVGContainer';
import { useSmartLayout } from '../hooks/useSmartLayout';
import { designerCache } from '../utils/visual/DesignerCache';
import { FlowEdges } from '../components/FlowEdges';
import { RendererContext } from '../contexts/RendererContext';
import { ActionGroup } from './ActionGroup';
var IfElseNodes;
(function (IfElseNodes) {
  IfElseNodes['Condition'] = 'conditionNode';
  IfElseNodes['Choice'] = 'choiceNode';
  IfElseNodes['IfBranch'] = 'ifBranchNode';
  IfElseNodes['ElseBranch'] = 'elseBranchNode';
})(IfElseNodes || (IfElseNodes = {}));
var calculateNodeMap = function (path, data) {
  var _a, _b;
  var result = transformIfCondtion(data, path);
  if (!result)
    return (
      (_a = {}),
      (_a[IfElseNodes.Condition] = new GraphNode()),
      (_a[IfElseNodes.Choice] = new GraphNode()),
      (_a[IfElseNodes.IfBranch] = new GraphNode()),
      (_a[IfElseNodes.ElseBranch] = new GraphNode()),
      _a
    );
  var condition = result.condition,
    choice = result.choice,
    ifGroup = result.ifGroup,
    elseGroup = result.elseGroup;
  return (
    (_b = {}),
    (_b[IfElseNodes.Condition] = GraphNode.fromIndexedJson(condition)),
    (_b[IfElseNodes.Choice] = GraphNode.fromIndexedJson(choice)),
    (_b[IfElseNodes.IfBranch] = GraphNode.fromIndexedJson(ifGroup)),
    (_b[IfElseNodes.ElseBranch] = GraphNode.fromIndexedJson(elseGroup)),
    _b
  );
};
var calculateIfElseLayout = function (nodeMap) {
  var conditionNode = nodeMap.conditionNode,
    choiceNode = nodeMap.choiceNode,
    ifBranchNode = nodeMap.ifBranchNode,
    elseBranchNode = nodeMap.elseBranchNode;
  return ifElseLayouter(conditionNode, choiceNode, ifBranchNode, elseBranchNode);
};
export var IfConditionWidget = function (_a) {
  var id = _a.id,
    data = _a.data,
    onEvent = _a.onEvent,
    onResize = _a.onResize,
    judgement = _a.judgement;
  var NodeWrapper = useContext(RendererContext).NodeWrapper;
  var nodeMap = useMemo(
    function () {
      return calculateNodeMap(id, data);
    },
    [id, data]
  );
  var _b = useSmartLayout(nodeMap, calculateIfElseLayout, onResize),
    layout = _b.layout,
    updateNodeBoundary = _b.updateNodeBoundary;
  var boundary = layout.boundary,
    edges = layout.edges;
  var conditionNode = nodeMap.conditionNode,
    choiceNode = nodeMap.choiceNode;
  return jsx(
    'div',
    { css: { width: boundary.width, height: boundary.height, position: 'relative' } },
    jsx(SVGContainer, { height: boundary.height, width: boundary.width }, jsx(FlowEdges, { edges: edges })),
    jsx(
      OffsetContainer,
      { offset: conditionNode.offset },
      jsx(
        NodeWrapper,
        { nodeData: data, nodeId: conditionNode.id, onEvent: onEvent },
        jsx(
          ElementMeasurer,
          {
            onResize: function (boundary) {
              designerCache.cacheBoundary(conditionNode.data, boundary);
              updateNodeBoundary(IfElseNodes.Condition, boundary);
            },
          },
          judgement
        )
      )
    ),
    jsx(
      OffsetContainer,
      { offset: choiceNode.offset },
      jsx(Diamond, {
        onClick: function () {
          onEvent(NodeEventTypes.Focus, { id: id });
        },
      })
    ),
    [IfElseNodes.IfBranch, IfElseNodes.ElseBranch].map(function (nodeName) {
      var node = nodeMap[nodeName];
      return jsx(
        OffsetContainer,
        { key: node.id + '/offset', offset: node.offset },
        jsx(ActionGroup, {
          key: node.id,
          data: node.data,
          id: node.id,
          onEvent: onEvent,
          onResize: function (size) {
            updateNodeBoundary(nodeName, size);
          },
        })
      );
    })
  );
};
IfConditionWidget.defaultProps = {
  onResize: function () {
    return null;
  },
};
//# sourceMappingURL=IfConditionWidget.js.map
