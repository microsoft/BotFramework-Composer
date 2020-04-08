// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';

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

const HeadSize = {
  width: TriggerSize.width,
  height: TriggerSize.height + ElementInterval.y / 2,
};
const TailSize = {
  width: TerminatorSize.width,
  height: TerminatorSize.height + ElementInterval.y / 2 + 5,
};

export const StepEditor = ({ id, data, onEvent, trigger, addCoachMarkRef }): JSX.Element => {
  const [stepGroupBoundary, setStepGroupBoundary] = useState<Boundary>(measureJsonBoundary(data));

  const hasNoSteps = !data || !Array.isArray(data.children) || data.children.length === 0;
  const content = hasNoSteps ? (
    <EdgeMenu
      onClick={$kind => onEvent(NodeEventTypes.Insert, { id, $kind, position: 0 })}
      data-testid="StepGroupAdd"
      id={`${id}[0]`}
      addCoachMarkRef={addCoachMarkRef}
    />
  ) : (
    <StepGroup
      id={id}
      addCoachMarkRef={addCoachMarkRef}
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

  const editorWidth =
    Math.min(
      Math.max(0, HeadSize.width / 2, TailSize.width / 2, contentBoundary.axisX),
      Math.max(0, HeadSize.width / 2, TailSize.width / 2, contentBoundary.width - contentBoundary.axisX)
    ) * 2;
  const editorHeight = HeadSize.height + TailSize.height + contentBoundary.height;
  const editorAxisX = editorWidth / 2;

  return (
    <div className="step-editor" css={{ position: 'relative', width: editorWidth, height: editorHeight }}>
      <SVGContainer>
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
          name="editor__end"
          r={TerminatorSize.height / 2 - 1}
          cx={editorAxisX}
          cy={contentBoundary.height + HeadSize.height + ElementInterval.y / 2 + TerminatorSize.height / 2}
          fill="none"
          stroke={ObiColors.LightGray}
          strokeWidth="2"
        />
      </SVGContainer>
      <OffsetContainer offset={{ x: editorAxisX - HeadSize.width / 2, y: 0 }}>
        <div className="step-editor__head" css={{ ...HeadSize, position: 'relative' }}>
          <OffsetContainer offset={{ x: 0, y: 0 }}>{trigger}</OffsetContainer>
        </div>
      </OffsetContainer>
      <OffsetContainer offset={{ x: editorAxisX - contentBoundary.axisX, y: HeadSize.height }}>
        {content}
      </OffsetContainer>
    </div>
  );
};
