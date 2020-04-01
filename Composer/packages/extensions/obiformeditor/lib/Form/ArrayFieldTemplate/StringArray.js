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
import { FontSizes, NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';
import { BaseField } from '../fields/BaseField';
import { arrayItemInputFieldContainer } from './styles';
import ArrayItem from './ArrayItem';
var StringArray = function(props) {
  var canAdd = props.canAdd,
    items = props.items,
    onAddClick = props.onAddClick;
  var _a = useState(''),
    value = _a[0],
    setValue = _a[1];
  var handleChange = useCallback(
    function(_, newValue) {
      return setValue(newValue || '');
    },
    [setValue]
  );
  var handleKeyDown = useCallback(
    function(event) {
      if (event.key.toLowerCase() === 'enter') {
        event.preventDefault();
        if (value) {
          onAddClick(event, value);
          setValue('');
        }
      }
    },
    [onAddClick, setValue, value]
  );
  return jsx(
    BaseField,
    __assign({}, props),
    jsx(
      'div',
      null,
      items.map(function(element, idx) {
        return jsx(ArrayItem, __assign({}, element, { key: idx }));
      })
    ),
    canAdd &&
      jsx(
        'div',
        { css: arrayItemInputFieldContainer },
        jsx(TextField, {
          onChange: handleChange,
          onKeyDown: handleKeyDown,
          value: value,
          iconProps: {
            iconName: 'ReturnKey',
            style: { color: SharedColors.cyanBlue10, opacity: 0.6 },
          },
          styles: { root: { width: '100%' } },
          'data-testid': 'string-array-text-input',
          ariaLabel: formatMessage('String value'),
        }),
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
      )
  );
};
StringArray.defaultProps = {
  formData: [],
  items: [],
  onAddClick: function() {},
};
export default StringArray;
//# sourceMappingURL=StringArray.js.map
