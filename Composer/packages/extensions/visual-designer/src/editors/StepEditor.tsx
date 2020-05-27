// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useCallback, useContext } from 'react';
import { useShellApi } from '@bfc/extension';

import { OffsetContainer } from '../adaptive-visual-sdk/components/OffsetContainer';
import { ElementInterval, TriggerSize, TerminatorSize } from '../adaptive-visual-sdk/constants/ElementSizes';
import { measureJsonBoundary } from '../adaptive-visual-sdk/layouters/measureJsonBoundary';
import { Boundary } from '../adaptive-visual-sdk/models/Boundary';
import { EdgeDirection } from '../adaptive-visual-sdk/models/EdgeData';
import { SVGContainer } from '../adaptive-visual-sdk/components/SVGContainer';
import { drawSVGEdge } from '../adaptive-visual-sdk/utils/visual/EdgeUtil';
import { ObiColors } from '../adaptive-visual-sdk/constants/ElementColors';
import { FlowRendererContext } from '../adaptive-visual-sdk/contexts/FlowRendererContext';
import { ActionGroup } from '../adaptive-visual-sdk/widgets';

const HeadSize = new Boundary(TriggerSize.width, TriggerSize.height + ElementInterval.y / 2);
const TailSize = new Boundary(TerminatorSize.width, TerminatorSize.height + ElementInterval.y / 2 + 5);

export const StepEditor = ({ id, data, onEvent, trigger }): JSX.Element => {
  const { EdgeMenu } = useContext(FlowRendererContext);
  const [stepGroupBoundary, setStepGroupBoundary] = useState<Boundary>(measureJsonBoundary(data));
  const { shellApi } = useShellApi();
  const { addCoachMarkRef } = shellApi;

  const addRef = useCallback((action: HTMLDivElement) => addCoachMarkRef({ action }), []);

  const hasNoSteps = !data || !Array.isArray(data.children) || data.children.length === 0;
  const content = hasNoSteps ? (
    <EdgeMenu arrayData={data} arrayId={id} arrayPosition={0} onEvent={onEvent} />
  ) : (
    <ActionGroup
      data={data}
      id={id}
      onEvent={onEvent}
      onResize={(boundary) => {
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
      aria-label="step-editor"
      /**
       * `maxWith: 100%` is important here. (refs https://developer.mozilla.org/en-US/docs/Web/CSS/align-items)
       * If the cross-size of an item is larger than the flex container, it will overflow equally in both directions.
       * Limit the max width to parent width to avoid left overfow.
       */
      className="step-editor"
      css={{ position: 'relative', width: editorWidth, height: editorHeight, maxWidth: '100%' }}
    >
      <SVGContainer height={editorHeight} width={editorWidth}>
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
          cx={editorAxisX}
          cy={contentBoundary.height + HeadSize.height + ElementInterval.y / 2 + TerminatorSize.height / 2}
          fill="none"
          r={TerminatorSize.height / 2 - 1}
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
