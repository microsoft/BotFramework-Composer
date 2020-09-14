// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ElementInterval } from '../constants/ElementSizes';
import { GraphLayout } from '../models/GraphLayout';
import { EdgeDirection } from '../models/EdgeData';
import { calculateForeachBoundary } from './calculateNodeBoundary';
var ForeachIntervalY = ElementInterval.y / 2;
export var foreachLayouter = function (foreachNode, stepsNode, loopBeginNode, loopEndNode) {
    if (!foreachNode || !stepsNode)
        return new GraphLayout();
    var containerBoundary = calculateForeachBoundary(foreachNode.boundary, stepsNode.boundary, loopBeginNode.boundary, loopEndNode.boundary);
    foreachNode.offset = {
        x: containerBoundary.axisX - foreachNode.boundary.axisX,
        y: 0,
    };
    loopBeginNode.offset = {
        x: containerBoundary.axisX - loopBeginNode.boundary.axisX,
        y: foreachNode.offset.y + foreachNode.boundary.height + ForeachIntervalY,
    };
    stepsNode.offset = {
        x: containerBoundary.axisX - stepsNode.boundary.axisX,
        y: loopBeginNode.offset.y + loopBeginNode.boundary.height + ForeachIntervalY,
    };
    loopEndNode.offset = {
        x: containerBoundary.axisX - loopEndNode.boundary.axisX,
        y: stepsNode.offset.y + stepsNode.boundary.height + ForeachIntervalY,
    };
    var edges = [];
    [foreachNode, loopBeginNode, stepsNode].forEach(function (node, index) {
        edges.push({
            id: "edge/axisX/" + node.id + "-" + index,
            direction: EdgeDirection.Down,
            x: containerBoundary.axisX,
            y: node.offset.y + node.boundary.height,
            length: ForeachIntervalY,
        });
    });
    [loopBeginNode, loopEndNode].forEach(function (node, index) {
        edges.push({
            id: "edge/" + node.id + "/loopIndicator[" + index + "]->left",
            direction: EdgeDirection.Right,
            x: 0,
            y: node.offset.y + node.boundary.axisY,
            length: containerBoundary.axisX - node.boundary.axisX,
            options: {
                dashed: true,
                directed: index === 0,
            },
        });
    });
    edges.push({
        id: "edge/" + foreachNode.id + "/loopback-vertical",
        direction: EdgeDirection.Down,
        x: 0,
        y: loopBeginNode.offset.y + loopBeginNode.boundary.axisY,
        length: loopEndNode.offset.y + loopEndNode.boundary.axisY - (loopBeginNode.offset.y + loopBeginNode.boundary.axisY),
        options: { dashed: true },
    });
    return {
        boundary: containerBoundary,
        nodeMap: {
            foreachNode: foreachNode,
            stepsNode: stepsNode,
            loopBeginNode: loopBeginNode,
            loopEndNode: loopEndNode,
        },
        edges: edges,
        nodes: [],
    };
};
//# sourceMappingURL=foreachLayouter.js.map