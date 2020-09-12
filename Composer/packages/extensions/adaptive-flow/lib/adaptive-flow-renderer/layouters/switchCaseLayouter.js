// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { BranchIntervalY } from '../constants/ElementSizes';
import { GraphNode } from '../models/GraphNode';
import { GraphLayout } from '../models/GraphLayout';
import { EdgeDirection } from '../models/EdgeData';
import { calculateSwitchCaseBoundary } from './calculateNodeBoundary';
import { calculateBranchNodesIntervalX } from './sharedLayouterUtils';
/**
 *        [switch]
 *           |
 *           ------------
 *           |   |  |   |
 */
export function switchCaseLayouter(conditionNode, choiceNode, branchNodes) {
    if (branchNodes === void 0) { branchNodes = []; }
    if (!conditionNode) {
        return new GraphLayout();
    }
    var containerBoundary = calculateSwitchCaseBoundary(conditionNode.boundary, choiceNode.boundary, branchNodes.map(function (x) { return x.boundary; }));
    /** Calulate nodes position */
    conditionNode.offset = {
        x: containerBoundary.axisX - conditionNode.boundary.axisX,
        y: 0,
    };
    choiceNode.offset = {
        x: containerBoundary.axisX - choiceNode.boundary.axisX,
        y: conditionNode.offset.y + conditionNode.boundary.height + BranchIntervalY,
    };
    var BottomelinePositionY = containerBoundary.height;
    var firstBranchNode = branchNodes[0] || new GraphNode();
    branchNodes.reduce(function (accOffsetX, x, currentIndex) {
        var _a;
        x.offset = {
            x: accOffsetX,
            y: choiceNode.offset.y + choiceNode.boundary.height + BranchIntervalY,
        };
        return (accOffsetX + x.boundary.width + calculateBranchNodesIntervalX(x.boundary, (_a = branchNodes[currentIndex + 1]) === null || _a === void 0 ? void 0 : _a.boundary));
    }, containerBoundary.axisX - firstBranchNode.boundary.axisX);
    /** Calculate edges */
    var edges = [];
    edges.push({
        id: "edge/" + conditionNode.id + "/switch/condition->switch",
        direction: EdgeDirection.Down,
        x: containerBoundary.axisX,
        y: conditionNode.offset.y + conditionNode.boundary.height,
        length: BranchIntervalY,
    });
    var BaselinePositionY = choiceNode.offset.y + choiceNode.boundary.axisY;
    branchNodes.forEach(function (x) {
        edges.push({
            id: "edge/" + choiceNode.id + "/case/baseline->" + x.id,
            direction: EdgeDirection.Down,
            x: x.offset.x + x.boundary.axisX,
            y: BaselinePositionY,
            length: x.offset.y - BaselinePositionY,
            options: { label: x.data.label },
        }, {
            id: "edge/" + choiceNode.id + "/case/" + x.id + "->bottom",
            direction: EdgeDirection.Down,
            x: x.offset.x + x.boundary.axisX,
            y: x.offset.y + x.boundary.height,
            length: BottomelinePositionY - x.offset.y - x.boundary.height,
        });
    });
    if (branchNodes.length > 1) {
        var lastBranchNode = branchNodes[branchNodes.length - 1] || new GraphNode();
        var baseLineLength = lastBranchNode.offset.x + lastBranchNode.boundary.axisX - containerBoundary.axisX;
        edges.push({
            id: "edge/" + conditionNode.id + "/baseline",
            direction: EdgeDirection.Right,
            x: containerBoundary.axisX,
            y: BaselinePositionY,
            length: baseLineLength,
        }, {
            id: "edge/" + conditionNode.id + "/bottomline",
            direction: EdgeDirection.Right,
            x: containerBoundary.axisX,
            y: BottomelinePositionY,
            length: baseLineLength,
        });
    }
    // TODO: remove this 'any' type conversion after LogicFlow PR.
    return {
        boundary: containerBoundary,
        nodeMap: { conditionNode: conditionNode, choiceNode: choiceNode, branchNodes: branchNodes },
        edges: edges,
        nodes: [],
    };
}
//# sourceMappingURL=switchCaseLayouter.js.map