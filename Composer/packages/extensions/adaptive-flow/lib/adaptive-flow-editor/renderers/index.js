// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { NodeEventTypes } from '../../adaptive-flow-renderer/constants/NodeEventTypes';
import { NodeMenu } from './NodeMenu';
import { EdgeMenu } from './EdgeMenu';
import { ActionNodeWrapper } from './NodeWrapper';
import { ElementWrapper } from './ElementWrapper';
export var VisualEditorNodeMenu = function (_a) {
    var nodeId = _a.nodeId, onEvent = _a.onEvent, _b = _a.colors, colors = _b === void 0 ? { color: 'black' } : _b;
    return React.createElement(NodeMenu, { colors: colors, id: nodeId, onEvent: onEvent });
};
export var VisualEditorEdgeMenu = function (_a) {
    var arrayId = _a.arrayId, arrayPosition = _a.arrayPosition, onEvent = _a.onEvent;
    return (React.createElement(EdgeMenu, { id: arrayId + "[" + arrayPosition + "]", onClick: function ($kind) { return onEvent(NodeEventTypes.Insert, { id: arrayId, position: arrayPosition, $kind: $kind }); } }));
};
export var VisualEditorNodeWrapper = function (_a) {
    var nodeId = _a.nodeId, nodeData = _a.nodeData, nodeTab = _a.nodeTab, onEvent = _a.onEvent, children = _a.children;
    return (React.createElement(ActionNodeWrapper, { data: nodeData, id: nodeId, tab: nodeTab, onEvent: onEvent }, children));
};
export var VisualEditorElementWrapper = ElementWrapper;
//# sourceMappingURL=index.js.map