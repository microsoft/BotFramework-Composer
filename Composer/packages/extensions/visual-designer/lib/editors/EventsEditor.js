// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { Panel } from '../components/lib/Panel';
import { RuleGroup, CollapsedRuleGroup } from '../components/groups';
import { NodeEventTypes } from '../constants/NodeEventTypes';
export var EventsEditor = function (_a) {
  var id = _a.id,
    data = _a.data,
    onEvent = _a.onEvent;
  var ruleCount = data.children.length;
  var title = 'Events (' + ruleCount + ')';
  return React.createElement(
    Panel,
    {
      addMenu: null,
      collapsedItems: React.createElement(CollapsedRuleGroup, { count: ruleCount }),
      title: title,
      onClickContent: function (e) {
        e.stopPropagation();
        onEvent(NodeEventTypes.FocusEvent, '');
      },
    },
    React.createElement(RuleGroup, { key: id, data: data, id: id, onEvent: onEvent })
  );
};
//# sourceMappingURL=EventsEditor.js.map
