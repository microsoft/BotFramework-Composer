// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';

import { Panel } from '../components/lib/Panel';
import { RuleGroup, CollapsedRuleGroup } from '../components/groups';
import { EventMenu } from '../components/menus/EventMenu';
import { NodeEventTypes } from '../constants/NodeEventTypes';

import { EditorProps } from './editorProps';

export const EventsEditor: FC<EditorProps> = ({ id, data, onEvent }): JSX.Element => {
  const ruleCount = data.children.length;
  const title = `Events (${ruleCount})`;

  const handleRuleEvent = (eventName: NodeEventTypes, eventData: any) => {
    if (eventName === NodeEventTypes.Expand) {
      const selectedRulePath = eventData;
      return onEvent(NodeEventTypes.FocusEvent, selectedRulePath);
    }
    if (eventName === NodeEventTypes.Insert) {
      return onEvent(NodeEventTypes.InsertEvent, eventData);
    }
    return onEvent(eventName, eventData);
  };

  const insertEvent = $type => onEvent(NodeEventTypes.InsertEvent, { id, $type, position: ruleCount });
  return (
    <Panel
      title={title}
      onClickContent={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.FocusEvent, '');
      }}
      collapsedItems={<CollapsedRuleGroup count={ruleCount} />}
      addMenu={<EventMenu onClick={insertEvent} data-testid="EventsEditorAdd" />}
    >
      <RuleGroup key={id} id={id} data={data} onEvent={handleRuleEvent} />
    </Panel>
  );
};
