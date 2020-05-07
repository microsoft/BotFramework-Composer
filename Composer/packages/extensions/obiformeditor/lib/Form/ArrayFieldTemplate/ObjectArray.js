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
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useCallback, useState } from 'react';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { FontSizes, NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';
import { BaseField } from '../fields/BaseField';
import { WidgetLabel } from '../widgets/WidgetLabel';
import ArrayItem from './ArrayItem';
import {
  arrayItemInputFieldContainer,
  arrayItemField,
  objectItemLabel,
  objectItemInputField,
  objectItemValueLabel,
} from './styles';
var ObjectArray = function(props) {
  var canAdd = props.canAdd,
    idSchema = props.idSchema,
    items = props.items,
    onAddClick = props.onAddClick,
    _a = props.schema,
    schema = _a === void 0 ? {} : _a,
    _b = props.uiSchema,
    uiSchema = _b === void 0 ? {} : _b;
  var object = (uiSchema['ui:options'] || {}).object;
  var _c = schema.items,
    itemSchema = _c === void 0 ? {} : _c;
  var _d = itemSchema.properties,
    properties = _d === void 0 ? {} : _d;
  var _e = useState({}),
    value = _e[0],
    setValue = _e[1];
  var handleChange = useCallback(
    function(property) {
      return function(_, newValue) {
        setValue(function(currentValue) {
          var _a;
          return __assign(__assign({}, currentValue), ((_a = {}), (_a[property] = newValue || ''), _a));
        });
      };
    },
    [setValue]
  );
  var handleKeyDown = useCallback(
    function(event) {
      if (event.key.toLowerCase() === 'enter') {
        event.preventDefault();
        if (Object.keys(value).length) {
          onAddClick(event, value);
          setValue({});
        }
      }
    },
    [onAddClick, setValue, value]
  );
  var isVisible = useCallback(
    function(property) {
      var itemsSchema = uiSchema.items;
      return !(
        itemsSchema['ui:hidden'] &&
        Array.isArray(itemsSchema['ui:hidden']) &&
        itemsSchema['ui:hidden'].includes(property)
      );
    },
    [uiSchema]
  );
  return jsx(
    BaseField,
    __assign({}, props),
    object &&
      jsx(
        'div',
        { css: objectItemLabel },
        Object.keys(properties)
          .filter(isVisible)
          .map(function(key, index) {
            var _a = properties[key],
              description = _a.description,
              title = _a.title;
            var _b = (idSchema[key] || {}).__id,
              __id = _b === void 0 ? '' : _b;
            return jsx(
              'div',
              { css: objectItemValueLabel, key: index },
              jsx(WidgetLabel, { description: description, label: title, inline: true, id: __id })
            );
          }),
        jsx('div', { style: { width: '32px' } })
      ),
    jsx(
      'div',
      { className: 'ObjectArray' },
      items.map(function(element, idx) {
        return jsx(ArrayItem, __assign({}, element, { key: idx }));
      }),
      canAdd &&
        (!object
          ? jsx(
              DefaultButton,
              {
                type: 'button',
                onClick: onAddClick,
                'data-testid': 'ArrayContainerAdd',
                styles: { root: { marginTop: '14px' } },
              },
              formatMessage('Add')
            )
          : jsx(
              'div',
              { css: arrayItemInputFieldContainer },
              jsx(
                'div',
                { css: arrayItemField },
                Object.keys(properties)
                  .filter(isVisible)
                  .map(function(property, index, items) {
                    return jsx(
                      'div',
                      { css: objectItemInputField, key: index },
                      jsx(TextField, {
                        autoComplete: 'off',
                        onChange: handleChange(property),
                        onKeyDown: handleKeyDown,
                        placeholder: formatMessage('Add new') + ' ' + property,
                        value: value[property] || '',
                        iconProps: __assign(
                          {},
                          index === items.length - 1
                            ? {
                                iconName: 'ReturnKey',
                                style: { color: SharedColors.cyanBlue10, opacity: 0.6 },
                              }
                            : {}
                        ),
                        'data-testid': 'object-array-text-input',
                      })
                    );
                  })
              ),
              jsx(IconButton, {
                disabled: true,
                menuIconProps: { iconName: 'MoreVertical' },
                ariaLabel: formatMessage('Item Actions'),
                styles: {
                  menuIcon: {
                    backgroundColor: NeutralColors.white,
                    color: NeutralColors.gray130,
                    fontSize: FontSizes.size16,
                  },
                  rootDisabled: {
                    backgroundColor: NeutralColors.white,
                  },
                },
              })
            ))
    )
  );
};
ObjectArray.defaultProps = {
  formData: [],
  items: [],
  onAddClick: function() {},
};
export default ObjectArray;
//# sourceMappingURL=ObjectArray.js.map
