// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react';

// eslint-disable-next-line no-unused-vars
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { RuleCard } from './templates/RuleCard';

function renderTitle(data) {
  if (data.$designer && data.$designer.name) {
    return data.$designer.name;
  } else if (data.intent) {
    return `Handle ${data.intent}`;
  } else {
    return 'Handle Intent...';
  }
}

export const IntentRule: FunctionComponent<NodeProps> = ({ id, data, focusedId, onEvent }) => {
  return <RuleCard id={id} data={data} label={renderTitle(data)} focusedId={focusedId} onEvent={onEvent} />;
};

IntentRule.defaultProps = defaultNodeProps;
