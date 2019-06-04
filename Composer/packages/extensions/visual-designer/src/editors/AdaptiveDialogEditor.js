import React, { useMemo, Fragment } from 'react';

import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeEventTypes } from '../shared/NodeEventTypes';
import { NodeProps, defaultNodeProps } from '../components/shared/sharedProps';
import { GraphNode } from '../components/shared/GraphNode';

import { StepEditor } from './StepEditor';
import { EventsEditor } from './EventsEditor';

const calculateNodeMap = (_, data) => {
  const { ruleGroup, stepGroup } = transformRootDialog(data);
  return {
    ruleGroup: GraphNode.fromIndexedJson(ruleGroup),
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

export const AdaptiveDialogEditor = ({ id, data, focusedId, onEvent }) => {
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { stepGroup, ruleGroup } = nodeMap;

  return (
    <div
      style={{
        position: 'relative',
      }}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, '');
      }}
    >
      {ruleGroup ? (
        <EventsEditor
          key={ruleGroup.id}
          id={ruleGroup.id}
          data={ruleGroup.data}
          focusedId={focusedId}
          onEvent={onEvent}
        />
      ) : null}
      {stepGroup ? (
        <div style={{ margin: '10px 0' }}>
          <StepEditor
            key={stepGroup.id}
            id={stepGroup.id}
            data={stepGroup.data}
            focusedId={focusedId}
            onEvent={onEvent}
          />
        </div>
      ) : null}
    </div>
  );
};

AdaptiveDialogEditor.propTypes = NodeProps;
AdaptiveDialogEditor.defaultProps = defaultNodeProps;
