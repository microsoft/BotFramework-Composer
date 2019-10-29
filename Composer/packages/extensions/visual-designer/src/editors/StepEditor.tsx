/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';

import { Terminator } from '../components/decorations/Terminator';
import { StepGroup } from '../components/groups';
import { Edge } from '../components/lib/EdgeComponents';
import { OffsetContainer } from '../components/lib/OffsetContainer';
import { EdgeMenu } from '../components/menus/EdgeMenu';
import { ElementInterval, TriggerSize, TerminatorSize } from '../constants/ElementSizes';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { measureJsonBoundary } from '../layouters/measureJsonBoundary';
import { Boundary } from '../models/Boundary';

const HeadSize = {
  width: TriggerSize.width,
  height: TriggerSize.height + ElementInterval.y / 2,
};
const TailSize = {
  width: TerminatorSize.width,
  height: TerminatorSize.height + ElementInterval.y / 2,
};

export const StepEditor = ({ id, data, onEvent, trigger }): JSX.Element => {
  const [stepGroupBoundary, setStepGroupBoundary] = useState<Boundary>(measureJsonBoundary(data));

  const hasNoSteps = !data || !Array.isArray(data.children) || data.children.length === 0;
  const content = hasNoSteps ? (
    <EdgeMenu
      onClick={$type => onEvent(NodeEventTypes.Insert, { id, $type, position: 0 })}
      data-testid="StepGroupAdd"
      id={`${id}[0]`}
    />
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
