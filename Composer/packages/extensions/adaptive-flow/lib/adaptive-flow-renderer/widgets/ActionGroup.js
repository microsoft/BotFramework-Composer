// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useContext } from 'react';
import { GraphNode } from '../models/GraphNode';
import { sequentialLayouter } from '../layouters/sequentialLayouter';
import { ElementInterval, EdgeAddButtonSize } from '../constants/ElementSizes';
import { transformStepGroup } from '../transformers/transformStepGroup';
import { defaultNodeProps } from '../types/nodeProps';
import { OffsetContainer } from '../components/OffsetContainer';
import { SVGContainer } from '../components/SVGContainer';
import { useSmartLayout } from '../hooks/useSmartLayout';
import { designerCache } from '../utils/visual/DesignerCache';
import { FlowEdges } from '../components/FlowEdges';
import { RendererContext } from '../contexts/RendererContext';
import { StepRenderer } from './AdaptiveAction';
var StepInterval = ElementInterval.y;
var getStepKey = function (stepOrder) { return "steps[" + stepOrder + "]"; };
var parseStepIndex = function (stepKey) { return parseInt(stepKey.replace(/steps\[(\d+)\]/, '$1')); };
var calculateNodes = function (groupId, data) {
    var steps = transformStepGroup(data, groupId);
    var stepNodes = steps.map(function (x) { return GraphNode.fromIndexedJson(x); });
    return stepNodes.reduce(function (result, node, index) {
        result[getStepKey(index)] = node;
        return result;
    }, {});
};
var calculateLayout = function (nodeMap) {
    var nodes = Object.keys(nodeMap)
        .sort(function (a, b) { return parseStepIndex(a) - parseStepIndex(b); })
        .map(function (stepName) { return nodeMap[stepName]; });
    return sequentialLayouter(nodes);
};
export var ActionGroup = function (_a) {
    var id = _a.id, data = _a.data, onEvent = _a.onEvent, onResize = _a.onResize;
    var EdgeMenu = useContext(RendererContext).EdgeMenu;
    var initialNodes = useMemo(function () { return calculateNodes(id, data); }, [id, data]);
    var _b = useSmartLayout(initialNodes, calculateLayout, onResize), layout = _b.layout, updateNodeBoundary = _b.updateNodeBoundary;
    var boundary = layout.boundary, nodes = layout.nodes, edges = layout.edges;
    return (jsx("div", { css: { width: boundary.width, height: boundary.height, position: 'relative' } },
        jsx(SVGContainer, { hidden: true, height: boundary.height, width: boundary.width },
            jsx(FlowEdges, { edges: edges })),
        nodes
            ? nodes.map(function (node, index) { return (jsx(OffsetContainer, { key: "stepGroup/" + node.id + "/offset", offset: node.offset },
                jsx(StepRenderer, { key: "stepGroup/" + node.id, data: node.data, id: node.id, onEvent: onEvent, onResize: function (size) {
                        designerCache.cacheBoundary(node.data, size);
                        updateNodeBoundary(getStepKey(index), size);
                    } }))); })
            : null,
        jsx(OffsetContainer, { css: { zIndex: 100 }, offset: { x: boundary.axisX - EdgeAddButtonSize.width / 2, y: 0 - EdgeAddButtonSize.height / 2 } },
            jsx(EdgeMenu, { arrayData: data, arrayId: id, arrayPosition: 0, onEvent: onEvent })),
        nodes
            ? nodes.map(function (x, idx) { return (jsx(OffsetContainer, { key: "stepGroup/" + x.id + "/footer/offset", css: { zIndex: 100 }, offset: {
                    x: boundary.axisX - EdgeAddButtonSize.width / 2,
                    y: x.offset.y + x.boundary.height + StepInterval / 2 - EdgeAddButtonSize.height / 2,
                } },
                jsx(EdgeMenu, { arrayData: data, arrayId: id, arrayPosition: idx + 1, onEvent: onEvent }))); })
            : null));
};
ActionGroup.defaultProps = defaultNodeProps;
//# sourceMappingURL=ActionGroup.js.map