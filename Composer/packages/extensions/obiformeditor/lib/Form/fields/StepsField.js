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
import { DialogGroup, createStepMenu } from '@bfc/shared';
import formatMessage from 'format-message';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DirectionalHint } from 'office-ui-fabric-react/lib/ContextualMenu';
import { setOverridesOnField } from '../utils';
import { TableField } from './TableField';
export var StepsField = function(props) {
  var formContext = props.formContext;
  var overrides = setOverridesOnField(formContext, 'StepsField');
  if (formContext.isRoot) {
    return null;
  }
  return React.createElement(
    TableField,
    __assign({}, props, overrides, {
      dialogOptionsOpts: {
        exclude: [DialogGroup.EVENTS, DialogGroup.ADVANCED_EVENTS, DialogGroup.SELECTOR, DialogGroup.OTHER],
      },
      navPrefix: props.name,
    }),
    function(_a) {
      var createNewItemAtIndex = _a.createNewItemAtIndex;
      return React.createElement(
        DefaultButton,
        {
          'data-testid': 'StepsFieldAdd',
          styles: { root: { marginTop: '20px' } },
          menuProps: {
            items: createStepMenu(
              [
                DialogGroup.RESPONSE,
                DialogGroup.INPUT,
                DialogGroup.BRANCHING,
                DialogGroup.STEP,
                DialogGroup.MEMORY,
                DialogGroup.CODE,
                DialogGroup.LOG,
              ],
              true,
              createNewItemAtIndex()
            ),
            calloutProps: { calloutMaxHeight: 500 },
            directionalHint: DirectionalHint.bottomLeftEdge,
          },
          type: 'button',
        },
        formatMessage('Add')
      );
    }
  );
};
//# sourceMappingURL=StepsField.js.map
