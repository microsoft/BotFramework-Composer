// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign } from "tslib";
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext, useMemo, useRef } from 'react';
import isEqual from 'lodash/isEqual';
import { OffsetContainer } from '../components/OffsetContainer';
import { ElementInterval, TriggerSize, TerminatorSize } from '../constants/ElementSizes';
import { measureJsonBoundary } from '../layouters/measureJsonBoundary';
import { Boundary } from '../models/Boundary';
import { EdgeDirection } from '../models/EdgeData';
import { SVGContainer } from '../components/SVGContainer';
import { drawSVGEdge } from '../utils/visual/EdgeUtil';
import { ObiColors } from '../constants/ElementColors';
import { RendererContext } from '../contexts/RendererContext';
import { ActionGroup } from '../widgets';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { transformObiRules } from '../transformers/transformObiRules';
import { GraphNode } from '../models/GraphNode';
import { TriggerSummary } from '../widgets/TriggerSummary';
import { outlineObiJson } from '../utils/adaptive/outlineObiJson';
var HeadSize = new Boundary(TriggerSize.width, TriggerSize.height + ElementInterval.y / 2);
var TailSize = new Boundary(TerminatorSize.width, TerminatorSize.height + ElementInterval.y / 2 + 5);
var calculateNodeMap = function (triggerId, triggerData) {
    var result = transformObiRules(triggerData, triggerId);
    if (!result)
        return {};
    var stepGroup = result.stepGroup;
    return {
        stepGroup: GraphNode.fromIndexedJson(stepGroup),
    };
};
export var AdaptiveTrigger = function (_a) {
    var triggerId = _a.triggerId, triggerData = _a.triggerData, onEvent = _a.onEvent;
    var outlineCache = useRef();
    var outlineVersion = useRef(0);
    var nodeMap = useMemo(function () {
        var newOutline = outlineObiJson(triggerData);
        if (!isEqual(newOutline, outlineCache.current)) {
            outlineCache.current = newOutline;
            outlineVersion.current += 1;
        }
        return calculateNodeMap(triggerId, triggerData);
    }, [triggerId, triggerData]);
    var stepGroup = nodeMap.stepGroup;
    var id = stepGroup.id, data = stepGroup.data;
    var EdgeMenu = useContext(RendererContext).EdgeMenu;
    var _b = useState(measureJsonBoundary(data)), stepGroupBoundary = _b[0], setStepGroupBoundary = _b[1];
    var trigger = jsx(TriggerSummary, { data: triggerData });
    var hasNoSteps = !data || !Array.isArray(data.children) || data.children.length === 0;
    var content = hasNoSteps ? (jsx(EdgeMenu, { arrayData: data, arrayId: id, arrayPosition: 0, onEvent: onEvent })) : (jsx(ActionGroup, { data: data, id: id, onEvent: onEvent, onResize: function (boundary) {
            if (boundary) {
                setStepGroupBoundary(boundary);
            }
        } }));
    var contentBoundary = hasNoSteps ? new Boundary(TerminatorSize.width, TerminatorSize.height) : stepGroupBoundary;
    var editorAxisX = Math.max(0, HeadSize.axisX, TailSize.axisX, contentBoundary.axisX);
    var editorWidth = editorAxisX +
        Math.max(0, HeadSize.width - HeadSize.axisX, TailSize.width - TailSize.axisX, contentBoundary.width - contentBoundary.axisX);
    var editorHeight = HeadSize.height + TailSize.height + contentBoundary.height;
    return (jsx("div", { key: triggerId + "?version=" + outlineVersion.current, className: "rule-editor", css: {
            position: 'relative',
            display: 'flex',
            width: '100%',
            flexDirection: 'column',
            alignItems: 'center',
        }, "data-testid": "RuleEditor", onClick: function (e) {
            e.stopPropagation();
            onEvent(NodeEventTypes.Focus, { id: '' });
        } },
        jsx("div", { "aria-label": "step-editor", 
            /**
             * `maxWith: 100%` is important here. (refs https://developer.mozilla.org/en-US/docs/Web/CSS/align-items)
             * If the cross-size of an item is larger than the flex container, it will overflow equally in both directions.
             * Limit the max width to parent width to avoid left overfow.
             */
            className: "step-editor", css: { position: 'relative', width: editorWidth, height: editorHeight, maxWidth: '100%' } },
            jsx(SVGContainer, { height: editorHeight, width: editorWidth },
                drawSVGEdge('editor-edge__head', editorAxisX, TriggerSize.height, EdgeDirection.Down, ElementInterval.y / 2),
                drawSVGEdge('editor-edge__tail', editorAxisX, contentBoundary.height + HeadSize.height, EdgeDirection.Down, ElementInterval.y / 2, { directed: true }),
                jsx("circle", { cx: editorAxisX, cy: contentBoundary.height + HeadSize.height + ElementInterval.y / 2 + TerminatorSize.height / 2, fill: "none", r: TerminatorSize.height / 2 - 1, stroke: ObiColors.LightGray, strokeWidth: "2" })),
            jsx(OffsetContainer, { offset: { x: editorAxisX - HeadSize.axisX, y: 0 } },
                jsx("div", { className: "step-editor__head", css: __assign(__assign({}, HeadSize), { position: 'relative' }) },
                    jsx(OffsetContainer, { offset: { x: 0, y: 0 } }, trigger))),
            jsx(OffsetContainer, { offset: { x: editorAxisX - contentBoundary.axisX, y: HeadSize.height } }, content))));
};
//# sourceMappingURL=AdaptiveTrigger.js.map