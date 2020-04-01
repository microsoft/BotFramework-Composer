// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
import React from 'react';
import formatMessage from 'format-message';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DirectionalHint } from 'office-ui-fabric-react/lib/ContextualMenu';
import get from 'lodash/get';
import { createStepMenu, DialogGroup } from '@bfc/shared';
import { setOverridesOnField } from '../utils';
import { TableField } from './TableField';
var renderTitle = function(item) {
  var friendlyName = get(item, '$designer.name');
  if (friendlyName) {
    return friendlyName;
  }
  var intentName = item.intent;
  if (intentName) {
    return intentName;
  }
  return item.$type;
};
export function RulesField(props) {
  var overrides = setOverridesOnField(props.formContext, 'RulesField');
  return React.createElement(
    TableField,
    __assign({}, props, overrides, {
      dialogOptionsOpts: { include: [DialogGroup.EVENTS], subMenu: false },
      label: formatMessage('Add New Rule'),
      navPrefix: 'triggers',
      renderTitle: renderTitle,
    }),
    function(_a) {
      var createNewItemAtIndex = _a.createNewItemAtIndex;
      return React.createElement(
        DefaultButton,
        {
          'data-testid': 'RulesFieldAdd',
          styles: { root: { marginTop: '20px' } },
          menuProps: {
            items: createStepMenu([DialogGroup.EVENTS], false, createNewItemAtIndex()),
            calloutProps: { calloutMaxHeight: 500 },
            directionalHint: DirectionalHint.bottomLeftEdge,
          },
          type: 'button',
        },
        formatMessage('Add')
      );
    }
  );
}
//# sourceMappingURL=RulesField.js.map
