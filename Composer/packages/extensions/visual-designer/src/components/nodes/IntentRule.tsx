// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react';
import formatMessage from 'format-message';

// eslint-disable-next-line no-unused-vars
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { RuleCard } from './templates/RuleCard';

// Generate the title displayed in the graph
// If a custom title has been specified, use this
// otherwise, display the name of the intent handled
// if no intent have yet been configured, display a generic title
function renderTitle(data): string {
  if (data.$designer && data.$designer.name) {
    return data.$designer.name;
  } else if (data.intent) {
    return formatMessage('Handle intent: {intent}', { intent: data.intent });
  } else {
    return formatMessage('Handle Intent...');
  }
}

export const IntentRule: FunctionComponent<NodeProps> = ({ id, data, focused, onEvent }) => {
  return <RuleCard id={id} data={data} label={renderTitle(data)} focused={focused} onEvent={onEvent} />;
};

IntentRule.defaultProps = defaultNodeProps;
