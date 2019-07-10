import React from 'react';
import { EventMenu } from 'shared-menus';

import { Panel } from '../components/nodes/templates/Panel';
import { RuleGroup, CollapsedRuleGroup } from '../components/groups';
import { NodeEventTypes } from '../shared/NodeEventTypes';

export const EventsEditor = ({ id, data, focusedId, onEvent, getLgTemplates }) => {
  const ruleCount = data.children.length;
  const title = `Skills (${ruleCount})`;

  const onClick = $type => {
    onEvent(NodeEventTypes.Insert, { id, $type, position: ruleCount });
  };

  return (
    <Panel
      title={title}
      collapsedItems={<CollapsedRuleGroup count={ruleCount} />}
      addMenu={<EventMenu onClick={onClick} />}
    >
      <RuleGroup key={id} id={id} data={data} focusedId={focusedId} getLgTemplates={getLgTemplates} onEvent={onEvent} />
    </Panel>
  );
};
