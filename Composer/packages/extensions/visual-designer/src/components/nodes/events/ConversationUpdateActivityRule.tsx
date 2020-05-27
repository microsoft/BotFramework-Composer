// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FunctionComponent } from 'react';
import formatMessage from 'format-message';

import { NodeProps, defaultNodeProps } from '../nodeProps';
import { RuleCard } from '../templates/RuleCard';

// Generate the title displayed in the graph
// If a custom title has been specified, use this
// otherwise, displays a generic message about the unknown intent rule.
function getTitle(data): string {
  if (data.$designer && data.$designer.name) {
    return data.$designer.name;
  } else {
    return formatMessage('Handle Conversation Update');
  }
}

export const ConversationUpdateActivityRule: FunctionComponent<NodeProps> = ({ id, data, focused, onEvent }) => {
  return <RuleCard data={data} focused={focused} id={id} label={getTitle(data)} onEvent={onEvent} />;
};
ConversationUpdateActivityRule.defaultProps = defaultNodeProps;
