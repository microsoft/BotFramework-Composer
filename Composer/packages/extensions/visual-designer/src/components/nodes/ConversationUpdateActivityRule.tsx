// eslint-disable-next-line no-unused-vars
import React, { FunctionComponent } from 'react';
import formatMessage from 'format-message';

// eslint-disable-next-line no-unused-vars
import { NodeProps, defaultNodeProps } from '../shared/sharedProps';

import { RuleCard } from './templates/RuleCard';

// Generate the title displayed in the graph
// If a custom title has been specified, use this
// otherwise, displays a generic message about the unknown intent rule.
function renderTitle(data) {
  if (data.$designer && data.$designer.name) {
    return data.$designer.name;
  } else {
    return formatMessage('Handle Conversation Update');
  }
}

export const ConversationUpdateActivityRule: FunctionComponent<NodeProps> = ({ id, data, focusedId, onEvent }) => {
  return <RuleCard id={id} data={data} label={renderTitle(data)} focusedId={focusedId} onEvent={onEvent} />;
};
ConversationUpdateActivityRule.defaultProps = defaultNodeProps;
