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
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import formatMessage from 'format-message';
import { createStepMenu, DialogGroup } from '@bfc/shared';
import ArrayItem from './ArrayItem';
var IDialogArray = function(props) {
  var items = props.items,
    canAdd = props.canAdd,
    onAddClick = props.onAddClick,
    TitleField = props.TitleField,
    DescriptionField = props.DescriptionField;
  return React.createElement(
    'div',
    { className: 'ArrayContainer' },
    React.createElement(TitleField, {
      title: props.title,
      id: props.idSchema.__id + '__title',
      required: props.required,
    }),
    React.createElement(DescriptionField, {
      description: props.schema.description,
      id: props.idSchema.__id + '__description',
    }),
    items.map(function(element, idx) {
      return React.createElement(ArrayItem, __assign({}, element, { key: idx }));
    }),
    canAdd &&
      React.createElement(
        PrimaryButton,
        {
          type: 'button',
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
              onAddClick
            ),
            // items: buildDialogOptions({
            //   filter: item => !item.includes('Rule'),
            //   onClick: (e, item) => onAddClick(e, item.data),
            // }),
            onItemClick: function(e, item) {
              var newItem = item && item.data;
              if (newItem) {
                onAddClick(e, newItem);
              }
            },
          },
          'data-testid': 'ArrayContainerAdd',
        },
        formatMessage('Add')
      )
  );
};
IDialogArray.defaultProps = {
  formData: [],
  items: [],
  onAddClick: function() {},
};
export default IDialogArray;
//# sourceMappingURL=IDialogArray.js.map
