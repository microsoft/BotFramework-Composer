import React, { useMemo, FC } from 'react';

import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeEventTypes } from '../shared/NodeEventTypes';
import { defaultNodeProps, EditorProps } from '../components/shared/sharedProps';
import { GraphNode } from '../shared/GraphNode';
import { Collapse } from '../components/nodes/templates/Collapse';

import { StepEditor } from './StepEditor';
import { EventsEditor } from './EventsEditor';

const calculateNodeMap = (_, data): { [id: string]: GraphNode } => {
  const result = transformRootDialog(data);
  if (!result) return {};

  const { ruleGroup, stepGroup } = result;
  return {
    ruleGroup: GraphNode.fromIndexedJson(ruleGroup),
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

export const AdaptiveDialogEditor: FC<EditorProps> = ({ id, data, onEvent, hideSteps }): JSX.Element => {
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { stepGroup, ruleGroup } = nodeMap;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onClick={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.Focus, '');
      }}
    >
      {ruleGroup && <EventsEditor key={ruleGroup.id} id={ruleGroup.id} data={ruleGroup.data} onEvent={onEvent} />}
      <div style={{ height: 50 }} />
      {!hideSteps && stepGroup && (
        <Collapse text="Actions">
          <StepEditor key={stepGroup.id} id={stepGroup.id} data={stepGroup.data} onEvent={onEvent} />
        </Collapse>
      )}
    </div>
  );
};

AdaptiveDialogEditor.defaultProps = defaultNodeProps;
