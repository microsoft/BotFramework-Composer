// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import formatMessage from 'format-message';
import { defaultNodeProps } from '../nodeProps';
import { RuleCard } from '../templates/RuleCard';
// Generate the title displayed in the graph
// If a custom title has been specified, use this
// otherwise, display the name of the intent handled
// if no intent have yet been configured, display a generic title
function renderTitle(data) {
  if (data.$designer && data.$designer.name) {
    return data.$designer.name;
  } else if (data.intent) {
    return formatMessage('Intent: {intent}', { intent: data.intent });
  } else {
    return formatMessage('Intent...');
  }
}
export var IntentRule = function (_a) {
  var id = _a.id,
    data = _a.data,
    focused = _a.focused,
    onEvent = _a.onEvent;
  return React.createElement(RuleCard, {
    data: data,
    focused: focused,
    id: id,
    label: renderTitle(data),
    onEvent: onEvent,
  });
};
IntentRule.defaultProps = defaultNodeProps;
//# sourceMappingURL=IntentRule.js.map
