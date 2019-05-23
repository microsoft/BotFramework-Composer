import React, { useMemo } from 'react';

import { NodeEventTypes } from '../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../components/shared/sharedProps';
import { GraphNode } from '../components/shared/GraphNode';
import { StepGroup } from '../components/groups';
import { transformObiRules } from '../transformers/transformObiRules';

const ColMargin = 10;

const calculateNodeMap = (_, data) => {
  const { ruleGroup, stepGroup } = transformObiRules(data, '$');
  return {
    ruleGroup: GraphNode.fromIndexedJson(ruleGroup),
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

export const RuleEditor = ({ id, data, focusedId, onEvent }) => {
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { stepGroup, ruleGroup } = nodeMap;

  return (
    <div
      style={{
        margin: 20,
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
          <StepGroup
            key={stepGroup.id}
            id={stepGroup.id}
            data={stepGroup.data}
            focusedId={focusedId}
            onEvent={onEvent}
          />
        </div>
      ) : null}
      {ruleGroup ? (
        <div style={{ margin: ColMargin }}>
          <StepGroup
            key={ruleGroup.id}
            id={ruleGroup.id}
            data={ruleGroup.data}
            focusedId={focusedId}
            onEvent={onEvent}
          />
        </div>
      ) : null}
    </div>
  );
};

RuleEditor.propTypes = NodeProps;
RuleEditor.defaultProps = defaultNodeProps;
