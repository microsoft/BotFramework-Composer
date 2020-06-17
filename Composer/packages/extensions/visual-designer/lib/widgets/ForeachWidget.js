// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo } from 'react';
import { transformForeach } from '../transformers/transformForeach';
import { foreachLayouter } from '../layouters/foreachLayouter';
import { GraphNode } from '../models/GraphNode';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { OffsetContainer } from '../components/lib/OffsetContainer';
import { LoopIndicator } from '../components/decorations/LoopIndicator';
import { StepGroup } from '../components/groups';
import { ElementWrapper } from '../components/renderers/ElementWrapper';
import { ElementMeasurer } from '../components/renderers/ElementMeasurer';
import { SVGContainer } from '../components/lib/SVGContainer';
import { useSmartLayout } from '../hooks/useSmartLayout';
import { designerCache } from '../store/DesignerCache';
import { FlowEdges } from '../components/lib/FlowEdges';
var ForeachNodes;
(function (ForeachNodes) {
  ForeachNodes['Foreach'] = 'foreachNode';
  ForeachNodes['LoopBegin'] = 'loopBeginNode';
  ForeachNodes['LoopEnd'] = 'loopEndNode';
  ForeachNodes['LoopActions'] = 'loopActionsNode';
})(ForeachNodes || (ForeachNodes = {}));
var calculateNodeMap = function (jsonpath, data) {
  var _a, _b;
  var result = transformForeach(data, jsonpath);
  if (!result)
    return (
      (_a = {}),
      (_a[ForeachNodes.Foreach] = new GraphNode()),
      (_a[ForeachNodes.LoopActions] = new GraphNode()),
      (_a[ForeachNodes.LoopBegin] = new GraphNode()),
      (_a[ForeachNodes.LoopEnd] = new GraphNode()),
      _a
    );
  var foreachDetail = result.foreachDetail,
    stepGroup = result.stepGroup,
    loopBegin = result.loopBegin,
    loopEnd = result.loopEnd;
  return (
    (_b = {}),
    (_b[ForeachNodes.Foreach] = GraphNode.fromIndexedJson(foreachDetail)),
    (_b[ForeachNodes.LoopActions] = GraphNode.fromIndexedJson(stepGroup)),
    (_b[ForeachNodes.LoopBegin] = GraphNode.fromIndexedJson(loopBegin)),
    (_b[ForeachNodes.LoopEnd] = GraphNode.fromIndexedJson(loopEnd)),
    _b
  );
};
var calculateForeachLayout = function (nodeMap) {
  var foreachNode = nodeMap.foreachNode,
    loopActionsNode = nodeMap.loopActionsNode,
    loopBeginNode = nodeMap.loopBeginNode,
    loopEndNode = nodeMap.loopEndNode;
  return foreachLayouter(foreachNode, loopActionsNode, loopBeginNode, loopEndNode);
};
export var ForeachWidget = function (_a) {
  var id = _a.id,
    data = _a.data,
    onEvent = _a.onEvent,
    onResize = _a.onResize,
    loop = _a.loop;
  var nodeMap = useMemo(
    function () {
      return calculateNodeMap(id, data);
    },
    [id, data]
  );
  var _b = useSmartLayout(nodeMap, calculateForeachLayout, onResize),
    layout = _b.layout,
    updateNodeBoundary = _b.updateNodeBoundary;
  var boundary = layout.boundary,
    edges = layout.edges;
  if (!nodeMap) {
    return null;
  }
  var foreachNode = nodeMap.foreachNode,
    loopActionsNode = nodeMap.loopActionsNode,
    loopBeginNode = nodeMap.loopBeginNode,
    loopEndNode = nodeMap.loopEndNode;
  return jsx(
    'div',
    { css: { width: boundary.width, height: boundary.height, position: 'relative' } },
    jsx(SVGContainer, { height: boundary.height, width: boundary.width }, jsx(FlowEdges, { edges: edges })),
    jsx(
      OffsetContainer,
      { offset: foreachNode.offset },
      jsx(
        ElementWrapper,
        { id: id, onEvent: onEvent },
        jsx(
          ElementMeasurer,
          {
            onResize: function (boundary) {
              designerCache.cacheBoundary(foreachNode.data, boundary);
              updateNodeBoundary(ForeachNodes.Foreach, boundary);
            },
          },
          loop
        )
      )
    ),
    jsx(
      OffsetContainer,
      { offset: loopActionsNode.offset },
      jsx(StepGroup, {
        key: loopActionsNode.id,
        data: loopActionsNode.data,
        id: loopActionsNode.id,
        onEvent: onEvent,
        onResize: function (size) {
          updateNodeBoundary(ForeachNodes.LoopActions, size);
        },
      })
    ),
    [loopBeginNode, loopEndNode]
      .filter(function (x) {
        return !!x;
      })
      .map(function (x, index) {
        return jsx(
          OffsetContainer,
          { key: id + '/loopicon-' + index + '/offset', offset: x.offset },
          jsx(LoopIndicator, {
            onClick: function () {
              return onEvent(NodeEventTypes.Focus, { id: id });
            },
          })
        );
      })
  );
};
ForeachWidget.defaultProps = {
  onResize: function () {
    return null;
  },
};
//# sourceMappingURL=ForeachWidget.js.map
