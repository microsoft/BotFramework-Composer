import React, { useMemo, FC } from 'react';

import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeEventTypes } from '../shared/NodeEventTypes';
import { defaultNodeProps, EditorProps } from '../components/shared/sharedProps';
import { GraphNode } from '../shared/GraphNode';

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
  const { ruleGroup } = nodeMap;

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
    </div>
  );
};

AdaptiveDialogEditor.defaultProps = defaultNodeProps;
