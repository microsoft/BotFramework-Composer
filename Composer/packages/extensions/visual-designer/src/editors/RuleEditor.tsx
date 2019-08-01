import React, { useMemo } from 'react';

import { NodeEventTypes } from '../shared/NodeEventTypes';
import { GraphNode } from '../shared/GraphNode';
import { defaultNodeProps } from '../components/shared/sharedProps';
import { Collapse } from '../components/nodes/templates/Collapse';
import { transformObiRules } from '../transformers/transformObiRules';

import { StepEditor } from './StepEditor';

const calculateNodeMap = (ruleId, data): { [id: string]: GraphNode } => {
  const result = transformObiRules(data, ruleId);
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
      className="rule-editor"
      style={{
        position: 'relative',
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, '');
      }}
    >
      <Collapse text="Actions">
        <StepEditor key={stepGroup.id} id={stepGroup.id} data={stepGroup.data} onEvent={onEvent} />
      </Collapse>
    </div>
  );
};

RuleEditor.defaultProps = defaultNodeProps;
