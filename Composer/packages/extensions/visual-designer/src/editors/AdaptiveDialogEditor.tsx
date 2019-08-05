import React, { useMemo, FC, useState } from 'react';

import { transformRootDialog } from '../transformers/transformRootDialog';
import { NodeEventTypes } from '../shared/NodeEventTypes';
import { defaultNodeProps, EditorProps } from '../components/shared/sharedProps';
import { GraphNode } from '../shared/GraphNode';
import { queryNode } from '../shared/jsonTracker';

import { EventsEditor } from './EventsEditor';
import { RuleEditor } from './RuleEditor';

const calculateNodeMap = (_, data): { [id: string]: GraphNode } => {
  const result = transformRootDialog(data);
  if (!result) return {};

  const { ruleGroup, stepGroup } = result;
  return {
    ruleGroup: GraphNode.fromIndexedJson(ruleGroup),
    stepGroup: GraphNode.fromIndexedJson(stepGroup),
  };
};

export const AdaptiveDialogEditor: FC<EditorProps> = ({ id, data, onEvent }): JSX.Element => {
  const nodeMap = useMemo(() => calculateNodeMap(id, data), [id, data]);
  const { ruleGroup } = nodeMap;

  const [activeEventId, setActiveEventId] = useState('');

  const interceptRuleEvent = (eventName: NodeEventTypes, eventData: any) => {
    if (eventName === NodeEventTypes.Expand) {
      const selectedRulePath = eventData;
      setActiveEventId(selectedRulePath);
      return onEvent(NodeEventTypes.Focus, selectedRulePath);
    }
    return onEvent(eventName, eventData);
  };

  const activeEventData = queryNode(data, activeEventId);
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
      {ruleGroup && (
        <EventsEditor key={ruleGroup.id} id={ruleGroup.id} data={ruleGroup.data} onEvent={interceptRuleEvent} />
      )}
      <div className="editor-interval" style={{ height: 50 }} />
      {activeEventId && <RuleEditor key={activeEventId} id={activeEventId} data={activeEventData} onEvent={onEvent} />}
    </div>
  );
};

AdaptiveDialogEditor.defaultProps = defaultNodeProps;
