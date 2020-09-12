// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ElementInterval } from '../constants/ElementSizes';
import { GraphLayout } from '../models/GraphLayout';
import { EdgeDirection } from '../models/EdgeData';
import { calculateSequenceBoundary } from './calculateNodeBoundary';
var StepInterval = ElementInterval.y;
var ExtraEdgeLength = ElementInterval.y / 2;
export function sequentialLayouter(nodes, withHeadEdge, withTrailingEdge) {
    if (withHeadEdge === void 0) { withHeadEdge = true; }
    if (withTrailingEdge === void 0) { withTrailingEdge = true; }
    if (!Array.isArray(nodes) || nodes.length === 0) {
        return new GraphLayout();
    }
    var box = calculateSequenceBoundary(nodes.map(function (x) { return x.boundary; }), withHeadEdge, withTrailingEdge);
    nodes.reduce(function (offsetY, node) {
        node.offset = { x: box.axisX - node.boundary.axisX, y: offsetY };
        return offsetY + node.boundary.height + StepInterval;
    }, 0);
    var edges = [];
    for (var i = 0; i < nodes.length - 1; i++) {
        var _a = nodes[i], id = _a.id, boundary = _a.boundary, offset = _a.offset;
        var x = box.axisX;
        var y = boundary.height + offset.y;
        edges.push({
            id: "edge/" + id + "->next",
            direction: EdgeDirection.Down,
            x: x,
            y: y,
            length: StepInterval,
            options: { directed: true },
        });
    }
    if (withHeadEdge) {
        nodes.forEach(function (node) {
            node.offset.y += ExtraEdgeLength;
        });
        edges.forEach(function (edge) {
            edge.y += ExtraEdgeLength;
        });
        edges.unshift({
            id: "edge/head/" + nodes[0].id + "--before",
            direction: EdgeDirection.Down,
            x: box.axisX,
            y: 0,
            length: ExtraEdgeLength,
            options: { directed: true },
        });
    }
    if (withTrailingEdge) {
        edges.push({
            id: "edge/tail/" + nodes[nodes.length - 1].id + "--after",
            direction: EdgeDirection.Down,
            x: box.axisX,
            y: box.height - ExtraEdgeLength,
            length: ExtraEdgeLength,
        });
    }
    return { boundary: box, nodes: nodes, edges: edges, nodeMap: {} };
}
//# sourceMappingURL=sequentialLayouter.js.map