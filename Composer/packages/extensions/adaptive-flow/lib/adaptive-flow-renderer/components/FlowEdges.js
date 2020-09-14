// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { renderEdge } from '../utils/visual/EdgeUtil';
export var FlowEdges = function (_a) {
    var edges = _a.edges;
    if (!Array.isArray(edges))
        return null;
    return React.createElement(React.Fragment, null, edges.map(function (edge) { return renderEdge(edge); }));
};
//# sourceMappingURL=FlowEdges.js.map