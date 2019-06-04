import React from 'react';
import { IconButton } from 'office-ui-fabric-react';

import { Panel } from '../components/nodes/templates/Panel';
import { RuleGroup } from '../components/groups';
import { EventMenu } from '../components/shared/EventMenu';

export const EventsEditor = ({ id, data, focusedId, onEvent }) => {
  return (
    <Panel
      title={
        <div
          className="events-title"
          style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div className="events-title__left" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <EventMenu id={id} onEvent={onEvent} />
            <span
              style={{
                flex: 1,
                color: '#605E5C',
                fontSize: '12px',
                lineHeight: '19px',
                height: '22px',
              }}
            >
              {`Triggers(${data.children.length})`}
            </span>
          </div>
          <IconButton
            iconProps={{
              iconName: 'ErrorBadge',
            }}
          />
        </div>
      }
    >
      <RuleGroup key={id} id={id} data={data} focusedId={focusedId} onEvent={onEvent} />
    </Panel>
  );
};
