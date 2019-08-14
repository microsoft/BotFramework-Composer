import React, { FC } from 'react';

import { Panel } from '../components/nodes/templates/Panel';
import { RuleGroup, CollapsedRuleGroup } from '../components/groups';
import { NodeEventTypes } from '../shared/NodeEventTypes';
import { EditorProps } from '../components/shared/sharedProps';
import { EventMenu } from '../components/menus/EventMenu';

export const EventsEditor: FC<EditorProps> = ({ id, data, onEvent }): JSX.Element => {
  const ruleCount = data.children.length;
  const title = `Events (${ruleCount})`;

  const onClick = $type => onEvent(NodeEventTypes.Insert, { id, $type, position: ruleCount });

  return (
    <Panel
      title={title}
      onClickContent={e => {
        e.stopPropagation();
        onEvent(NodeEventTypes.FocusEvent, '');
      }}
      collapsedItems={<CollapsedRuleGroup count={ruleCount} />}
      addMenu={<EventMenu onClick={onClick} data-testid="EventsEditorAdd" />}
    >
      <RuleGroup key={id} id={id} data={data} onEvent={onEvent} />
    </Panel>
  );
};
