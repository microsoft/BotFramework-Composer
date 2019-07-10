import React, { useMemo } from 'react';

import { NodeEventTypes } from '../shared/NodeEventTypes';
import { defaultNodeProps } from '../components/shared/sharedProps';
import { GraphNode } from '../shared/GraphNode';
import { transformObiRules } from '../transformers/transformObiRules';

import { StepEditor } from './StepEditor';

const ColMargin = 10;

const calculateNodeMap = (_, data) => {
  const { ruleGroup, stepGroup } = transformObiRules(data);
  return {
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

export const RuleEditor = ({ id, data, focusedId, onEvent, getLgTemplates }) => {
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
          <StepEditor
            key={stepGroup.id}
            id={stepGroup.id}
            data={stepGroup.data}
            focusedId={focusedId}
            onEvent={onEvent}
            getLgTemplates={getLgTemplates}
          />
        </div>
      ) : null}
    </div>
  );
};

RuleEditor.defaultProps = defaultNodeProps;
