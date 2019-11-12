// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useMemo, useRef } from 'react';
import { isEqual } from 'lodash';

import { Trigger } from '../components/nodes/Trigger';
import { defaultNodeProps } from '../components/nodes/nodeProps';
import { NodeEventTypes } from '../constants/NodeEventTypes';
import { GraphNode } from '../models/GraphNode';
import { transformObiRules } from '../transformers/transformObiRules';
import { outlineObiJson } from '../utils/outlineObiJson';

import { StepEditor } from './StepEditor';

const calculateNodeMap = (ruleId, data): { [id: string]: GraphNode } => {
  const result = transformObiRules(data, ruleId);
  if (!result) return {};

  const { stepGroup } = result;
  return {
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

/**
 * `Rule` means a single element stored in the array `AdaptiveDialog.rules`.
 * Usually, a Rule may contain a series of steps.
 */
export const RuleEditor = ({ id, data, onEvent, addCoachMarkRef }): JSX.Element => {
  const outlineCache = useRef();
  const outlineVersion = useRef(0);

  const nodeMap = useMemo(() => {
    const newOutline = outlineObiJson(data);
    if (!isEqual(newOutline, outlineCache.current)) {
      outlineCache.current = newOutline;
      outlineVersion.current += 1;
    }
    return calculateNodeMap(id, data);
  }, [id, data]);

  const { stepGroup } = nodeMap;

  return (
    <div
      className="rule-editor"
      data-testid="RuleEditor"
      css={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, { id: '' });
      }}
    >
      <StepEditor
        key={stepGroup.id + '?version=' + outlineVersion.current}
        id={stepGroup.id}
        data={stepGroup.data}
        onEvent={onEvent}
        trigger={<Trigger data={data} />}
        addCoachMarkRef={addCoachMarkRef}
      />
    </div>
  );
};

RuleEditor.defaultProps = defaultNodeProps;
