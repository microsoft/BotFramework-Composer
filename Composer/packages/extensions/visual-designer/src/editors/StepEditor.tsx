// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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

const HeadSize = new Boundary(TriggerSize.width, TriggerSize.height + ElementInterval.y / 2);
const TailSize = new Boundary(TerminatorSize.width, TerminatorSize.height + ElementInterval.y / 2 + 5);

export const StepEditor = ({ id, data, onEvent, trigger }): JSX.Element => {
  const [stepGroupBoundary, setStepGroupBoundary] = useState<Boundary>(measureJsonBoundary(data));
  const { shellApi } = useShellApi();
  const { addCoachMarkRef } = shellApi;

  const addRef = useCallback((action: HTMLDivElement) => addCoachMarkRef({ action }), []);

  const hasNoSteps = !data || !Array.isArray(data.children) || data.children.length === 0;
  const content = hasNoSteps ? (
    <EdgeMenu id={`${id}[0]`} onClick={$kind => onEvent(NodeEventTypes.Insert, { id, $kind, position: 0 })} />
  ) : (
    <StepGroup
      id={id}
      data={data}
      onEvent={onEvent}
      onResize={boundary => {
        if (boundary) {
          setStepGroupBoundary(boundary);
        }
      }}
    />
  );
  const contentBoundary = hasNoSteps ? new Boundary(TerminatorSize.width, TerminatorSize.height) : stepGroupBoundary;

  const editorAxisX = Math.max(0, HeadSize.axisX, TailSize.axisX, contentBoundary.axisX);
  const editorWidth =
    editorAxisX +
    Math.max(
      0,
      HeadSize.width - HeadSize.axisX,
      TailSize.width - TailSize.axisX,
      contentBoundary.width - contentBoundary.axisX
    );
  const editorHeight = HeadSize.height + TailSize.height + contentBoundary.height;

  return (
    <div
      className="step-editor"
      /**
       * `maxWith: 100%` is important here. (refs https://developer.mozilla.org/en-US/docs/Web/CSS/align-items)
       * If the cross-size of an item is larger than the flex container, it will overflow equally in both directions.
       * Limit the max width to parent width to avoid left overfow.
       */
      css={{ position: 'relative', width: editorWidth, height: editorHeight, maxWidth: '100%' }}
      aria-label="step-editor"
    >
      <SVGContainer width={editorWidth} height={editorHeight}>
        {drawSVGEdge('editor-edge__head', editorAxisX, TriggerSize.height, EdgeDirection.Down, ElementInterval.y / 2)}
        {drawSVGEdge(
          'editor-edge__tail',
          editorAxisX,
          contentBoundary.height + HeadSize.height,
          EdgeDirection.Down,
          ElementInterval.y / 2,
          { directed: true }
        )}
        <circle
          r={TerminatorSize.height / 2 - 1}
          cx={editorAxisX}
          cy={contentBoundary.height + HeadSize.height + ElementInterval.y / 2 + TerminatorSize.height / 2}
          fill="none"
          stroke={ObiColors.LightGray}
          strokeWidth="2"
        />
      </SVGContainer>
      <OffsetContainer offset={{ x: editorAxisX - HeadSize.axisX, y: 0 }}>
        <div className="step-editor__head" css={{ ...HeadSize, position: 'relative' }}>
          <OffsetContainer offset={{ x: 0, y: 0 }}>{trigger}</OffsetContainer>
        </div>
      </OffsetContainer>
      <OffsetContainer offset={{ x: editorAxisX + ElementInterval.x, y: HeadSize.height + ElementInterval.y }}>
        {/* Coarchmark bubble appears here */}
        <div ref={addRef}></div>
      </OffsetContainer>
      <OffsetContainer offset={{ x: editorAxisX - contentBoundary.axisX, y: HeadSize.height }}>
        {content}
      </OffsetContainer>
    </div>
  );
};
