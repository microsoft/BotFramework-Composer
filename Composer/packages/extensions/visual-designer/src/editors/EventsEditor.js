import React from 'react';

import { Panel } from '../components/nodes/templates/Panel';
import { RuleGroup, CollapsedRuleGroup } from '../components/groups';
import { EventMenu } from '../components/shared/EventMenu';

export const EventsEditor = ({ id, data, focusedId, onEvent }) => {
  const ruleCount = data.children.length;
  const title = `Skills (${ruleCount})`;

  return (
    <Panel
      title={title}
      collapsedItems={<CollapsedRuleGroup count={ruleCount} />}
      addMenu={<EventMenu id={id} onEvent={onEvent} />}
    >
      <RuleGroup key={id} id={id} data={data} focusedId={focusedId} onEvent={onEvent} />
    </Panel>
  );
};
