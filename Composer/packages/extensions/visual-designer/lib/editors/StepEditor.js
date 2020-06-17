// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useCallback } from 'react';
import { useShellApi } from '@bfc/extension';
import { StepGroup } from '../components/groups';
import { OffsetContainer } from '../components/lib/OffsetContainer';
import { EdgeMenu } from '../components/menus/EdgeMenu';
import { ElementInterval, TriggerSize, TerminatorSize } from '../constants/ElementSizes';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { measureJsonBoundary } from '../layouters/measureJsonBoundary';
import { Boundary } from '../models/Boundary';
import { EdgeDirection } from '../models/EdgeData';
import { SVGContainer } from '../components/lib/SVGContainer';
import { drawSVGEdge } from '../components/lib/EdgeUtil';
import { ObiColors } from '../constants/ElementColors';
var HeadSize = new Boundary(TriggerSize.width, TriggerSize.height + ElementInterval.y / 2);
var TailSize = new Boundary(TerminatorSize.width, TerminatorSize.height + ElementInterval.y / 2 + 5);
export var StepEditor = function (_a) {
  var id = _a.id,
    data = _a.data,
    onEvent = _a.onEvent,
    trigger = _a.trigger;
  var _b = useState(measureJsonBoundary(data)),
    stepGroupBoundary = _b[0],
    setStepGroupBoundary = _b[1];
  var shellApi = useShellApi().shellApi;
  var addCoachMarkRef = shellApi.addCoachMarkRef;
  var addRef = useCallback(function (action) {
    return addCoachMarkRef({ action: action });
  }, []);
  var hasNoSteps = !data || !Array.isArray(data.children) || data.children.length === 0;
  var content = hasNoSteps
    ? jsx(EdgeMenu, {
        'data-testid': 'StepGroupAdd',
        forwardedRef: addRef,
        id: id + '[0]',
        onClick: function ($kind) {
          return onEvent(NodeEventTypes.Insert, { id: id, $kind: $kind, position: 0 });
        },
      })
    : jsx(StepGroup, {
        data: data,
        id: id,
        onEvent: onEvent,
        onResize: function (boundary) {
          if (boundary) {
            setStepGroupBoundary(boundary);
          }
        },
      });
  var contentBoundary = hasNoSteps ? new Boundary(TerminatorSize.width, TerminatorSize.height) : stepGroupBoundary;
  var editorAxisX = Math.max(0, HeadSize.axisX, TailSize.axisX, contentBoundary.axisX);
  var editorWidth =
    editorAxisX +
    Math.max(
      0,
      HeadSize.width - HeadSize.axisX,
      TailSize.width - TailSize.axisX,
      contentBoundary.width - contentBoundary.axisX
    );
  var editorHeight = HeadSize.height + TailSize.height + contentBoundary.height;
  return jsx(
    'div',
    {
      'aria-label': 'step-editor',
      /**
       * `maxWith: 100%` is important here. (refs https://developer.mozilla.org/en-US/docs/Web/CSS/align-items)
       * If the cross-size of an item is larger than the flex container, it will overflow equally in both directions.
       * Limit the max width to parent width to avoid left overfow.
       */
      className: 'step-editor',
      css: { position: 'relative', width: editorWidth, height: editorHeight, maxWidth: '100%' },
    },
    jsx(
      SVGContainer,
      { height: editorHeight, width: editorWidth },
      drawSVGEdge('editor-edge__head', editorAxisX, TriggerSize.height, EdgeDirection.Down, ElementInterval.y / 2),
      drawSVGEdge(
        'editor-edge__tail',
        editorAxisX,
        contentBoundary.height + HeadSize.height,
        EdgeDirection.Down,
        ElementInterval.y / 2,
        { directed: true }
      ),
      jsx('circle', {
        cx: editorAxisX,
        cy: contentBoundary.height + HeadSize.height + ElementInterval.y / 2 + TerminatorSize.height / 2,
        fill: 'none',
        r: TerminatorSize.height / 2 - 1,
        stroke: ObiColors.LightGray,
        strokeWidth: '2',
      })
    ),
    jsx(
      OffsetContainer,
      { offset: { x: editorAxisX - HeadSize.axisX, y: 0 } },
      jsx(
        'div',
        { className: 'step-editor__head', css: __assign(__assign({}, HeadSize), { position: 'relative' }) },
        jsx(OffsetContainer, { offset: { x: 0, y: 0 } }, trigger)
      )
    ),
    jsx(OffsetContainer, { offset: { x: editorAxisX - contentBoundary.axisX, y: HeadSize.height } }, content)
  );
};
//# sourceMappingURL=StepEditor.js.map
