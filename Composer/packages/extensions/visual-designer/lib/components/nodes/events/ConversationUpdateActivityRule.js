// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import formatMessage from 'format-message';
import { defaultNodeProps } from '../nodeProps';
import { RuleCard } from '../templates/RuleCard';
// Generate the title displayed in the graph
// If a custom title has been specified, use this
// otherwise, displays a generic message about the unknown intent rule.
function getTitle(data) {
  if (data.$designer && data.$designer.name) {
    return data.$designer.name;
  } else {
    return formatMessage('Handle Conversation Update');
  }
}
export var ConversationUpdateActivityRule = function (_a) {
  var id = _a.id,
    data = _a.data,
    focused = _a.focused,
    onEvent = _a.onEvent;
  return React.createElement(RuleCard, {
    data: data,
    focused: focused,
    id: id,
    label: getTitle(data),
    onEvent: onEvent,
  });
};
ConversationUpdateActivityRule.defaultProps = defaultNodeProps;
//# sourceMappingURL=ConversationUpdateActivityRule.js.map
