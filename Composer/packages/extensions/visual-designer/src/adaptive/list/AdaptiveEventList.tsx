// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC } from 'react';
import { BaseSchema } from '@bfc/shared';

import { Panel } from '../../components/lib/Panel';
import { RuleGroup, CollapsedRuleGroup } from '../../components/groups';
import { EventMenu } from '../../components/menus/EventMenu';
import { NodeEventTypes } from '../../constants/NodeEventTypes';
import { ObiTypes } from '../../constants/ObiTypes';

export interface AdaptiveEventListProps {
  path: string;
  events: BaseSchema[];
  onEvent: (eventName: NodeEventTypes, eventData?: any) => any;
}

export const AdaptiveEventList: FC<AdaptiveEventListProps> = ({ path, events, onEvent }): JSX.Element => {
  const eventCount = events.length;
  const title = `Events (${eventCount})`;

  const handleEditorEvent = (eventName: NodeEventTypes, eventData: any) => {
    if (eventName === NodeEventTypes.Expand) {
      const selectedRulePath = eventData;
      return onEvent(NodeEventTypes.FocusEvent, selectedRulePath);
    }
    if (eventName === NodeEventTypes.Insert) {
      return onEvent(NodeEventTypes.InsertEvent, eventData);
    }
    return onEvent(eventName, eventData);
  };

  const insertEvent = $type => onEvent(NodeEventTypes.InsertEvent, { id: path, $type, position: eventCount });

  const data = { $type: ObiTypes.RuleGroup, children: events };
  return (
    <Panel
      title={title}
      onClickContent={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.FocusEvent, '');
      }}
      collapsedItems={<CollapsedRuleGroup count={eventCount} />}
      addMenu={<EventMenu onClick={insertEvent} data-testid="EventsEditorAdd" />}
    >
      <RuleGroup key={path} id={path} data={data} onEvent={handleEditorEvent} />
    </Panel>
  );
};

AdaptiveEventList.defaultProps = {
  path: '',
  events: [],
  onEvent: () => null,
};
