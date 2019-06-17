import React from 'react';

import { Panel } from '../components/nodes/templates/Panel';
import { RuleGroup, CollapsedRuleGroup } from '../components/groups';
import { EventMenu } from '../components/shared/EventMenu';
import { NodeEventTypes } from '../shared/NodeEventTypes';

export const EventsEditor = ({ id, data, focusedId, onEvent }) => {
  const ruleCount = data.children.length;
  const title = `Skills (${ruleCount})`;

  const onClick = $type => {
    onEvent(NodeEventTypes.Insert, { id, $type, position: ruleCount });
  };

  return (
    <Panel
      title={title}
      collapsedItems={<CollapsedRuleGroup count={ruleCount} />}
      addMenu={<EventMenu id={id} onClick={onClick} />}
    >
      <RuleGroup key={id} id={id} data={data} focusedId={focusedId} onEvent={onEvent} />
    </Panel>
  );
};
