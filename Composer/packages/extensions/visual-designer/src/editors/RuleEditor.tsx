import React, { useMemo } from 'react';

import { NodeEventTypes } from '../shared/NodeEventTypes';
import { defaultNodeProps } from '../components/shared/sharedProps';
import { GraphNode } from '../shared/GraphNode';
import { transformObiRules } from '../transformers/transformObiRules';

import { StepEditor } from './StepEditor';

const ColMargin = 10;

const calculateNodeMap = (_, data): { [id: string]: GraphNode } => {
  const result = transformObiRules(data);
  if (!result) return {};

  const { stepGroup } = result;
  return {
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

export const RuleEditor = ({ id, data, onEvent }): JSX.Element => {
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { stepGroup } = nodeMap;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
      }}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, '');
      }}
    >
      {stepGroup ? (
        <div style={{ margin: ColMargin }}>
          <StepEditor key={stepGroup.id} id={stepGroup.id} data={stepGroup.data} onEvent={onEvent} />
        </div>
      ) : null}
    </div>
  );
};

RuleEditor.defaultProps = defaultNodeProps;
