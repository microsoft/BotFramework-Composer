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
/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useCallback, useState } from 'react';
import { FontSizes, NeutralColors, SharedColors } from '@uifabric/fluent-theme';
import { IconButton } from 'office-ui-fabric-react/lib/Button';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import formatMessage from 'format-message';
import { BaseField } from './BaseField';
import { customObjectFieldContainer, customObjectFieldItem, customObjectFieldLabel } from './styles';
import { EditableField } from './EditableField';
var ObjectItem = function(_a) {
  var originalName = _a.name,
    formData = _a.formData,
    value = _a.value,
    handleNameChange = _a.handleNameChange,
    handleValueChange = _a.handleValueChange,
    handleDropPropertyClick = _a.handleDropPropertyClick;
  var _b = useState(originalName),
    name = _b[0],
    setName = _b[1];
  var _c = useState(''),
    errorMessage = _c[0],
    setErrorMessage = _c[1];
  var contextItems = [
    {
      iconProps: { iconName: 'Cancel' },
      key: 'remove',
      onClick: handleDropPropertyClick,
      text: formatMessage('Remove'),
    },
  ];
  var handleBlur = useCallback(
    function() {
      if (name !== originalName && Object.keys(formData).includes(name)) {
        setErrorMessage(formatMessage('Keys must be unique'));
      } else {
        handleNameChange(name);
        setErrorMessage('');
      }
    },
    [formData, handleNameChange, name, originalName, setErrorMessage]
  );
  return jsx(
    'div',
    { css: customObjectFieldContainer },
    jsx(
      'div',
      { css: customObjectFieldItem },
      jsx(EditableField, {
        autoComplete: 'off',
        onBlur: handleBlur,
        onChange: function(_, newValue) {
          return setName(newValue || '');
        },
        options: { transparentBorder: true },
        placeholder: formatMessage('Add a new key'),
        value: name,
        styles: {
          errorMessage: { display: 'block', paddingTop: 0 },
          root: { margin: '7px 0 7px 0' },
        },
        errorMessage: errorMessage,
      })
    ),
    jsx(
      'div',
      { css: customObjectFieldItem },
      jsx(EditableField, {
        autoComplete: 'off',
        onChange: handleValueChange,
        options: { transparentBorder: true },
        placeholder: formatMessage('Add a new value'),
        value: value,
        styles: {
          root: { margin: '7px 0 7px 0' },
        },
      })
    ),
    jsx(IconButton, {
      ariaLabel: formatMessage('Edit Property'),
      menuProps: { items: contextItems },
      menuIconProps: { iconName: 'MoreVertical' },
      styles: {
        root: { margin: '7px 0 7px 0' },
        menuIcon: { color: NeutralColors.black, fontSize: FontSizes.size16 },
      },
    })
  );
};
export var CustomObjectField = function(props) {
  var _a = props.formData,
    formData = _a === void 0 ? {} : _a,
    additionalProperties = props.schema.additionalProperties,
    onChange = props.onChange;
  var _b = useState(''),
    name = _b[0],
    setName = _b[1];
  var _c = useState(''),
    value = _c[0],
    setValue = _c[1];
  var handleKeyDown = useCallback(
    function(event) {
      var _a;
      if (event.key.toLowerCase() === 'enter') {
        event.preventDefault();
        if (name && !Object.keys(formData).includes(name)) {
          onChange(__assign(__assign({}, formData), ((_a = {}), (_a[name] = value), _a)));
          setName('');
          setValue('');
        }
      }
    },
    [formData, onChange, name, setName, setValue, value]
  );
  var handleNameChange = useCallback(
    function(name) {
      return function(newName) {
        var _a;
        var _b = name,
          value = formData[_b],
          rest = __rest(formData, [typeof _b === 'symbol' ? _b : _b + '']);
        var newFormData = !(newName || value)
          ? rest
          : __assign(__assign({}, rest), ((_a = {}), (_a[newName] = value), _a));
        onChange(newFormData);
      };
    },
    [formData, onChange]
  );
  var handleValueChange = useCallback(
    function(name) {
      return function(_, newValue) {
        var _a;
        onChange(__assign(__assign({}, formData), ((_a = {}), (_a[name] = newValue || ''), _a)));
      };
    },
    [formData, onChange]
  );
  var handleDropPropertyClick = useCallback(
    function(name) {
      return function() {
        var _a = name,
          _ = formData[_a],
          newFormData = __rest(formData, [typeof _a === 'symbol' ? _a : _a + '']);
        onChange(newFormData);
      };
    },
    [formData, onChange]
  );
  return jsx(
    BaseField,
    __assign({}, props, { className: 'JsonField' }),
    jsx(
      'div',
      { css: customObjectFieldContainer },
      jsx('div', { css: [customObjectFieldItem, customObjectFieldLabel] }, formatMessage('Key')),
      jsx('div', { css: [customObjectFieldItem, customObjectFieldLabel] }, formatMessage('Value'))
    ),
    Object.entries(formData).map(function(_a, index) {
      var name = _a[0],
        value = _a[1];
      return jsx(ObjectItem, {
        key: index,
        formData: formData,
        name: name,
        value: value,
        handleNameChange: handleNameChange(name),
        handleValueChange: handleValueChange(name),
        handleDropPropertyClick: handleDropPropertyClick(name),
      });
    }),
    additionalProperties &&
      jsx(
        'div',
        { css: customObjectFieldContainer },
        jsx(
          'div',
          { css: customObjectFieldItem },
          jsx(TextField, {
            autoComplete: 'off',
            onChange: function(_, newValue) {
              return setName(newValue || '');
            },
            onKeyDown: handleKeyDown,
            placeholder: formatMessage('Add a new key'),
            value: name,
            styles: {
              root: { margin: '7px 0 7px 0' },
            },
          })
        ),
        jsx(
          'div',
          { css: customObjectFieldItem },
          jsx(TextField, {
            autoComplete: 'off',
            onChange: function(_, newValue) {
              return setValue(newValue || '');
            },
            onKeyDown: handleKeyDown,
            placeholder: formatMessage('Add a new value'),
            value: value,
            iconProps: {
              iconName: 'ReturnKey',
              style: { color: SharedColors.cyanBlue10, opacity: 0.6 },
            },
            styles: {
              root: { margin: '7px 0 7px 0' },
            },
          })
        ),
        jsx(IconButton, {
          ariaLabel: formatMessage('Edit Property'),
          disabled: true,
          menuIconProps: { iconName: 'MoreVertical' },
          styles: {
            menuIcon: { fontSize: FontSizes.size16 },
            root: { margin: '7px 0 7px 0' },
            rootDisabled: {
              backgroundColor: NeutralColors.white,
            },
          },
        })
      )
  );
};
//# sourceMappingURL=CustomObjectField.js.map
