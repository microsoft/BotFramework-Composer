// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FunctionComponent } from 'react';
import formatMessage from 'format-message';

import { RuleCard } from '../templates/RuleCard';
import { NodeProps, defaultNodeProps } from '../nodeProps';

// Generate the title displayed in the graph
// If a custom title has been specified, use this
// otherwise, displays a generic message about the unknown intent rule.
function renderTitle(data): string {
  if (data.$designer && data.$designer.name) {
    return data.$designer.name;
  } else {
    // data.$kind.split('.')[1]
    return formatMessage('Handle Unknown Intent');
  }
}

export const UnknownIntentRule: FunctionComponent<NodeProps> = ({ id, data, focused, onEvent }) => {
  return <RuleCard data={data} focused={focused} id={id} label={renderTitle(data)} onEvent={onEvent} />;
};
UnknownIntentRule.defaultProps = defaultNodeProps;
