// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useRef } from 'react';
import isEqual from 'lodash/isEqual';

import { TriggerSummary } from '../widgets/TriggerSummary';
import { NodeEventTypes, EditorEventHandler } from '../constants/NodeEventTypes';
import { GraphNode } from '../models/GraphNode';
import { transformObiRules } from '../transformers/transformObiRules';
import { outlineObiJson } from '../utils/adaptive/outlineObiJson';

import { StepEditor } from './StepEditor';

const calculateNodeMap = (triggerId, triggerData): { [id: string]: GraphNode } => {
  const result = transformObiRules(triggerData, triggerId);
  if (!result) return {};

  const { stepGroup } = result;
  return {
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

export interface AdaptiveTriggerProps {
  triggerId: string;
  triggerData: any;
  onEvent: EditorEventHandler;
}

export const AdaptiveTrigger: React.FC<AdaptiveTriggerProps> = ({ triggerId, triggerData, onEvent }): JSX.Element => {
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

  return (
    <div
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
      <StepEditor
        key={stepGroup.id + '?version=' + outlineVersion.current}
        data={stepGroup.data}
        id={stepGroup.id}
        trigger={<TriggerSummary data={triggerData} />}
        onEvent={onEvent}
      />
    </div>
  );
};

AdaptiveTrigger.defaultProps = {
  triggerId: '',
  triggerData: {},
  onEvent: () => null,
};
