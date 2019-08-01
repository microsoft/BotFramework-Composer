import React, { useMemo, useRef } from 'react';
import { isEqual } from 'lodash';

import { NodeEventTypes } from '../shared/NodeEventTypes';
import { GraphNode } from '../shared/GraphNode';
import { defaultNodeProps } from '../components/shared/sharedProps';
import { Collapse } from '../components/nodes/templates/Collapse';
import { transformObiRules } from '../transformers/transformObiRules';
import { outlineObiJson } from '../shared/outlineObiJson';

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
export const RuleEditor = ({ id, data, onEvent }): JSX.Element => {
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
        {outlineVersion.current}
        <StepEditor
          key={stepGroup.id + '?version=' + outlineVersion.current}
          id={stepGroup.id}
          data={stepGroup.data}
          onEvent={onEvent}
        />
      </Collapse>
    </div>
  );
};

RuleEditor.defaultProps = defaultNodeProps;
