// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FunctionComponent } from 'react';
import formatMessage from 'format-message';

import { NodeProps, defaultNodeProps } from '../nodeProps';
import { RuleCard } from '../templates/RuleCard';

// Generate the title displayed in the graph
// If a custom title has been specified, use this
// otherwise, display the name of the events handled
// if no events have yet been configured, display a generic title
function renderTitle(data): string {
  if (data.$designer && data.$designer.name) {
    return data.$designer.name;
  } else if (data.events && data.events.length) {
    return formatMessage(
      `Events: {event} {
        count, plural,
           =0 {}
        other {+#}
      }`,
      {
        event: data.events[0],
        count: data.events.length - 1,
      }
    );
  } else {
    return formatMessage('Event...');
  }
}

export const EventRule: FunctionComponent<NodeProps> = ({ id, data, focused, onEvent }) => {
  return <RuleCard data={data} focused={focused} id={id} label={renderTitle(data)} onEvent={onEvent} />;
};
EventRule.defaultProps = defaultNodeProps;
