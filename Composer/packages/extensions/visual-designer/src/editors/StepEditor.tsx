/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';

import { StepGroup } from '../components/groups';
import { OffsetContainer } from '../components/lib/OffsetContainer';
import { Edge } from '../components/lib/EdgeComponents';
import { measureJsonBoundary } from '../layouters/measureJsonBoundary';
import { NodeEventTypes } from '../shared/NodeEventTypes';
import { Boundary } from '../models/Boundary';
import { ElementInterval, TriggerSize, TerminatorSize } from '../shared/elementSizes';
import { EdgeMenu } from '../components/menus/EdgeMenu';
import { Terminator } from '../components/decorations/Terminator';

const HeadSize = {
  width: TriggerSize.width,
  height: TriggerSize.height + ElementInterval.y / 2,
};
const TailSize = {
  width: TerminatorSize.width,
  height: TerminatorSize.height + ElementInterval.y / 2,
};

export const StepEditor = ({ id, data, onEvent, trigger }): JSX.Element => {
  const [stepGroupBoundary, setStepGroupBoundary] = useState(measureJsonBoundary(data));

  const hasNoSteps = !data || !Array.isArray(data.children) || data.children.length === 0;
  const content = hasNoSteps ? (
    <EdgeMenu
      onClick={$type => onEvent(NodeEventTypes.Insert, { id, $type, position: 0 })}
      data-testid="StepGroupAdd"
    />
  ) : (
    <StepGroup
      id={id}
      data={data}
      onEvent={onEvent}
      onResize={boundary => {
        setStepGroupBoundary(boundary);
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
      <OffsetContainer offset={{ x: editorAxisX - HeadSize.width / 2, y: 0 }}>
        <div className="step-editor__head" css={{ ...HeadSize, position: 'relative' }}>
          <OffsetContainer offset={{ x: 0, y: 0 }}>{trigger}</OffsetContainer>
          <Edge direction="y" x={HeadSize.width / 2} y={TriggerSize.height} length={ElementInterval.y / 2} />
        </div>
      </OffsetContainer>
      <OffsetContainer offset={{ x: editorAxisX - contentBoundary.axisX, y: HeadSize.height }}>
        {content}
      </OffsetContainer>
      <OffsetContainer offset={{ x: editorAxisX - TailSize.width / 2, y: contentBoundary.height + HeadSize.height }}>
        <div className="step-editor__tail" css={{ ...TailSize, position: 'relative' }}>
          <Edge direction="y" x={TailSize.width / 2} y={0} length={ElementInterval.y / 2} directed={true} />
          <OffsetContainer offset={{ x: -1, y: ElementInterval.y / 2 }}>
            <Terminator />
          </OffsetContainer>
        </div>
      </OffsetContainer>
    </div>
  );
};
