// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __rest } from "tslib";
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useContext } from 'react';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { transformSwitchCondition } from '../transformers/transformSwitchCondition';
import { switchCaseLayouter } from '../layouters/switchCaseLayouter';
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
var SwitchNodes;
(function (SwitchNodes) {
    SwitchNodes["Switch"] = "switchNode";
    SwitchNodes["Choice"] = "choiceNode";
})(SwitchNodes || (SwitchNodes = {}));
var getCaseKey = function (caseIndex) { return "cases[" + caseIndex + "]"; };
var parseCaseIndex = function (caseKey) { return parseInt(caseKey.replace(/cases\[(\d+)\]/, '$1')); };
var calculateNodeMap = function (path, data) {
    var _a, _b;
    var result = transformSwitchCondition(data, path);
    if (!result)
        return _a = {},
            _a[SwitchNodes.Switch] = new GraphNode(),
            _a[SwitchNodes.Choice] = new GraphNode(),
            _a;
    var condition = result.condition, choice = result.choice, branches = result.branches;
    var nodeMap = (_b = {},
        _b[SwitchNodes.Switch] = GraphNode.fromIndexedJson(condition),
        _b[SwitchNodes.Choice] = GraphNode.fromIndexedJson(choice),
        _b);
    branches.forEach(function (branch, index) {
        var key = getCaseKey(index);
        var value = GraphNode.fromIndexedJson(branch);
        nodeMap[key] = value;
    });
    return nodeMap;
};
var calculateLayout = function (nodeMap) {
    var _a = nodeMap, switchNode = _a.switchNode, choiceNode = _a.choiceNode, cases = __rest(_a, ["switchNode", "choiceNode"]);
    var casesNodes = Object.keys(cases)
        .sort(function (a, b) { return parseCaseIndex(a) - parseCaseIndex(b); })
        .map(function (caseName) { return nodeMap[caseName]; });
    return switchCaseLayouter(switchNode, choiceNode, casesNodes);
};
export var SwitchConditionWidget = function (_a) {
    var id = _a.id, data = _a.data, onEvent = _a.onEvent, onResize = _a.onResize, judgement = _a.judgement;
    var NodeWrapper = useContext(RendererContext).NodeWrapper;
    var nodeMap = useMemo(function () { return calculateNodeMap(id, data); }, [id, data]);
    var _b = useSmartLayout(nodeMap, calculateLayout, onResize), layout = _b.layout, updateNodeBoundary = _b.updateNodeBoundary;
    var boundary = layout.boundary, edges = layout.edges;
    var _c = nodeMap, switchNode = _c.switchNode, choiceNode = _c.choiceNode, cases = __rest(_c, ["switchNode", "choiceNode"]);
    var casesNodes = Object.keys(cases).map(function (x) { return nodeMap[x]; });
    return (jsx("div", { css: { width: boundary.width, height: boundary.height, position: 'relative' } },
        jsx(SVGContainer, { height: boundary.height, width: boundary.width },
            jsx(FlowEdges, { edges: edges })),
        jsx(OffsetContainer, { offset: switchNode.offset },
            jsx(NodeWrapper, { nodeData: data, nodeId: switchNode.id, onEvent: onEvent },
                jsx(ElementMeasurer, { onResize: function (boundary) {
                        designerCache.cacheBoundary(switchNode.data, boundary);
                        updateNodeBoundary(SwitchNodes.Switch, boundary);
                    } }, judgement))),
        jsx(OffsetContainer, { css: { zIndex: 100 }, offset: choiceNode.offset },
            jsx(Diamond, { "data-testid": "SwitchConditionDiamond", onClick: function () {
                    onEvent(NodeEventTypes.Focus, { id: id });
                } })),
        casesNodes.map(function (x, index) { return (jsx(OffsetContainer, { key: x.id + "/offset", offset: x.offset },
            jsx(ActionGroup, { key: x.id, data: x.data, id: x.id, onEvent: onEvent, onResize: function (size) {
                    updateNodeBoundary(getCaseKey(index), size);
                } }))); })));
};
SwitchConditionWidget.defaultProps = {
    onResize: function () { return null; },
};
//# sourceMappingURL=SwitchConditionWidget.js.map