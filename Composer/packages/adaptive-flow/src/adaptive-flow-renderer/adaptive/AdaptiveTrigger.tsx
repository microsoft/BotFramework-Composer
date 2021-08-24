// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, useContext, useMemo, useRef, useEffect } from 'react';
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
import { NodeEventTypes, EditorEventHandler } from '../constants/NodeEventTypes';
import { transformObiRules } from '../transformers/transformObiRules';
import { GraphNode } from '../models/GraphNode';
import { TriggerSummary } from '../widgets/TriggerSummary';
import { outlineObiJson } from '../utils/adaptive/outlineObiJson';

const calculateNodeMap = (triggerId, triggerData): { [id: string]: GraphNode } => {
  const result = transformObiRules(triggerData, triggerId);
  if (!result) return {};

  const { stepGroup } = result;
  return {
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

const TailSize = new Boundary(TerminatorSize.width, TerminatorSize.height + ElementInterval.y / 2);

const checkTrailingPVAQuestionAction = (triggerData: any): boolean => {
  if (!Array.isArray(triggerData.actions)) return false;
  const actions = triggerData.actions;
  const lastAction = actions[actions.length - 1];

  return lastAction && lastAction.$kind === 'Microsoft.VirtualAgents.Question';
};

export interface AdaptiveTriggerProps {
  triggerId: string;
  triggerData: any;
  onEvent: EditorEventHandler;
}

export const AdaptiveTrigger: React.FC<AdaptiveTriggerProps> = ({ triggerId, triggerData, onEvent }): JSX.Element => {
  const [HeadSize, setHeadSize] = useState(new Boundary(TriggerSize.width, TriggerSize.height + ElementInterval.y / 2));

  useEffect(() => {
    if (triggerData?.intent) {
      const bounds = TriggerSize.height + ElementInterval.y / 2;
      setHeadSize(new Boundary(TriggerSize.width, bounds + 58));
    } else {
      setHeadSize(new Boundary(TriggerSize.width, TriggerSize.height + ElementInterval.y / 2));
    }
  }, [triggerData]);

  const outlineCache = useRef();
  const outlineVersion = useRef(0);

  const nodeMap = useMemo(() => {
    const newOutline = outlineObiJson(triggerData);
    if (!isEqual(newOutline, outlineCache.current)) {
      outlineCache.current = newOutline;
      outlineVersion.current += 1;
    }
    return calculateNodeMap(triggerId, triggerData);
  }, [triggerId, triggerData]);

  const { stepGroup } = nodeMap;

  const { id, data } = stepGroup;

  const { EdgeMenu } = useContext(RendererContext);
  const [stepGroupBoundary, setStepGroupBoundary] = useState<Boundary>(measureJsonBoundary(data));

  const trigger = (
    <TriggerSummary
      data={triggerData}
      id={triggerId}
      onEvent={onEvent}
      onResize={(boundary) => {
        if (boundary) {
          setStepGroupBoundary(boundary);
        }
      }}
    />
  );

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

  const hasTrailingQuestionAction = checkTrailingPVAQuestionAction(triggerData);

  return (
    <div
      key={`${triggerId}?version=${outlineVersion.current}`}
      className="rule-editor"
      css={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      data-testid="RuleEditor"
      onClick={(e) => {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, { id: '' });
      }}
    >
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
          {hasTrailingQuestionAction
            ? null
            : drawSVGEdge(
                'editor-edge__tail',
                editorAxisX,
                contentBoundary.height + HeadSize.height,
                EdgeDirection.Down,
                ElementInterval.y / 2,
                { directed: true }
              )}
          {hasTrailingQuestionAction ? null : (
            <circle
              cx={editorAxisX}
              cy={contentBoundary.height + HeadSize.height + ElementInterval.y / 2 + TerminatorSize.height / 2}
              fill="none"
              r={TerminatorSize.height / 2 - 1}
              stroke={ObiColors.LightGray}
              strokeWidth="2"
            />
          )}
        </SVGContainer>
        <OffsetContainer offset={{ x: editorAxisX - HeadSize.axisX, y: 0 }}>
          <div className="step-editor__head" css={{ position: 'relative' }}>
            <OffsetContainer offset={{ x: 0, y: 0 }}>{trigger}</OffsetContainer>
          </div>
        </OffsetContainer>
        <OffsetContainer offset={{ x: editorAxisX - contentBoundary.axisX, y: HeadSize.height }}>
          {content}
        </OffsetContainer>
      </div>
    </div>
  );
};
