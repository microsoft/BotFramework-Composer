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
var __rest =
  (this && this.__rest) ||
  function(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    return t;
  };
import React, { useState, useEffect } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { NeutralColors } from '@uifabric/fluent-theme';
import { mergeStyleSets } from '@uifabric/styling';
export var EditableField = function(props) {
  var _a = props.styles,
    styles = _a === void 0 ? {} : _a,
    placeholder = props.placeholder,
    fontSize = props.fontSize,
    onChange = props.onChange,
    onBlur = props.onBlur,
    value = props.value,
    ariaLabel = props.ariaLabel,
    _b = props.options,
    options = _b === void 0 ? {} : _b,
    rest = __rest(props, ['styles', 'placeholder', 'fontSize', 'onChange', 'onBlur', 'value', 'ariaLabel', 'options']);
  var transparentBorder = options.transparentBorder;
  var _c = useState(false),
    editing = _c[0],
    setEditing = _c[1];
  var _d = useState(false),
    hasFocus = _d[0],
    setHasFocus = _d[1];
  var _f = useState(value),
    localValue = _f[0],
    setLocalValue = _f[1];
  var _g = useState(false),
    hasBeenEdited = _g[0],
    setHasBeenEdited = _g[1];
  useEffect(
    function() {
      if (!hasBeenEdited) {
        setLocalValue(value);
      }
    },
    [value]
  );
  var handleChange = function(_e, newValue) {
    setLocalValue(newValue);
    setHasBeenEdited(true);
    onChange(_e, newValue);
  };
  var handleCommit = function(e) {
    setHasFocus(false);
    setEditing(false);
    onBlur && onBlur(e);
  };
  var borderColor = undefined;
  if (!editing) {
    borderColor = localValue || transparentBorder ? 'transparent' : NeutralColors.gray30;
  }
  return React.createElement(
    'div',
    {
      onMouseEnter: function() {
        return setEditing(true);
      },
      onMouseLeave: function() {
        return !hasFocus && setEditing(false);
      },
    },
    React.createElement(
      TextField,
      __assign(
        {
          placeholder: placeholder || value,
          value: localValue,
          styles: mergeStyleSets(
            {
              root: { margin: '5px 0 7px 0' },
              field: {
                fontSize: fontSize,
                selectors: {
                  '::placeholder': {
                    fontSize: fontSize,
                  },
                },
              },
              fieldGroup: {
                borderColor: borderColor,
                transition: 'border-color 0.1s linear',
                selectors: {
                  ':hover': {
                    borderColor: hasFocus ? undefined : NeutralColors.gray30,
                  },
                },
              },
            },
            styles
          ),
          onBlur: handleCommit,
          onFocus: function() {
            return setHasFocus(true);
          },
          onChange: handleChange,
          autoComplete: 'off',
          ariaLabel: ariaLabel,
        },
        rest
      )
    )
  );
};
//# sourceMappingURL=EditableField.js.map
