import React, { useState } from 'react';

import { StepGroup } from '../components/groups';
import { EdgeMenu } from '../components/shared/EdgeMenu';
import { NodeEventTypes } from '../shared/NodeEventTypes';
import { Icon } from '../components/nodes/icons/icon';
import { Boundary } from '../shared/Boundary';
import { ElementInterval, InitNodeSize } from '../shared/elementSizes';
import { OffsetContainer } from '../shared/OffsetContainer';
import { Edge } from '../components/shared/EdgeComponents';

const TriggerSize = { width: 280, height: 40 };
const CircleSize = { width: 14, height: 14 };

const Circle = () => <div style={{ ...CircleSize, border: '2px solid #A4A4A4', borderRadius: '14px' }} />;
const Trigger = () => (
  <div
    style={{ ...TriggerSize, border: '1px solid #979797', background: 'white', display: 'flex', alignItems: 'center' }}
  >
    <div style={{ width: 30, height: 30, padding: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon icon="MessageBot" size={30} color="#5C2D91" />
    </div>
    Trigger
  </div>
);

const HeadSize = {
  width: TriggerSize.width,
  height: TriggerSize.height + ElementInterval.y / 2,
};
const TailSize = {
  width: CircleSize.width,
  height: CircleSize.height + ElementInterval.y / 2,
};

export const StepEditor = ({ id, data, focusedId, onEvent }) => {
  const [stepGroupBoundary, setStepGroupBoundary] = useState(new Boundary(InitNodeSize.width, InitNodeSize.height));

  const hasNoSteps = !data || !Array.isArray(data.children) || data.children.length === 0;
  const content = hasNoSteps ? (
    <EdgeMenu onClick={$type => onEvent(NodeEventTypes.Insert, { id, $type, position: 0 })} />
  ) : (
    <StepGroup
      id={id}
      data={data}
      focusedId={focusedId}
      onEvent={onEvent}
      onResize={boundary => {
        setStepGroupBoundary(boundary);
      }}
    />
  );
  const contentBoundary = hasNoSteps ? new Boundary(CircleSize.width, CircleSize.height) : stepGroupBoundary;

  const editorWidth =
    Math.min(
      Math.max(0, HeadSize.width / 2, TailSize.width / 2, contentBoundary.axisX),
      Math.max(0, HeadSize.width / 2, TailSize.width / 2, contentBoundary.width - contentBoundary.axisX)
    ) * 2;
  const editorHeight = HeadSize.height + TailSize.height + contentBoundary.height;
  const editorAxisX = editorWidth / 2;

  return (
    <div className="step-editor" style={{ position: 'relative', width: editorWidth, height: editorHeight }}>
      <OffsetContainer offset={{ x: editorAxisX - HeadSize.width / 2 }}>
        <div className="step-editor__head" style={{ ...HeadSize, position: 'relative' }}>
          <OffsetContainer offset={{ x: 0, y: 0 }}>
            <Trigger />
          </OffsetContainer>
          <OffsetContainer>
            <Edge direction="y" x={TriggerSize.width / 2} y={TriggerSize.height} length={ElementInterval.y / 2} />
          </OffsetContainer>
        </div>
      </OffsetContainer>
      <OffsetContainer offset={{ x: editorAxisX - contentBoundary.axisX, y: HeadSize.height }}>
        {content}
      </OffsetContainer>
      <OffsetContainer offset={{ x: editorAxisX - TailSize.width / 2, y: contentBoundary.height + HeadSize.height }}>
        <div className="step-editor__tail" style={{ ...TailSize, position: 'relative' }}>
          <Edge direction="y" x={CircleSize.width / 2} y={0} length={ElementInterval.y / 2} />
          <OffsetContainer offset={{ x: -1, y: ElementInterval.y / 2 }}>
            <Circle />
          </OffsetContainer>
        </div>
      </OffsetContainer>
    </div>
  );
};
