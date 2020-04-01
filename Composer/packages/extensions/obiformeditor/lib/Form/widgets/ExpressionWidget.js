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
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import formatMessage from 'format-message';
import get from 'lodash/get';
import { EditableField } from '../fields/EditableField';
import { WidgetLabel } from './WidgetLabel';
var getDefaultErrorMessage = function(errMessage) {
  return formatMessage.rich('{errMessage}. Refer to the syntax documentation<a>here</a>', {
    errMessage: errMessage,
    a: function(_a) {
      var children = _a.children;
      return React.createElement(
        'a',
        {
          key: 'a',
          href:
            'https://github.com/microsoft/BotBuilder-Samples/blob/master/experimental/common-expression-language/prebuilt-functions.md',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
        children
      );
    },
  });
};
export var ExpressionWidget = function(props) {
  var _a;
  var formContext = props.formContext,
    schema = props.schema,
    id = props.id,
    label = props.label,
    value = props.value,
    editable = props.editable,
    hiddenErrMessage = props.hiddenErrMessage,
    onValidate = props.onValidate,
    _b = props.options,
    options = _b === void 0 ? {} : _b,
    rest = __rest(props, [
      'formContext',
      'schema',
      'id',
      'label',
      'value',
      'editable',
      'hiddenErrMessage',
      'onValidate',
      'options',
    ]);
  var description = schema.description;
  var hideLabel = options.hideLabel;
  var name =
    (_a = props.id) === null || _a === void 0
      ? void 0
      : _a
          .split('_')
          .slice(1)
          .join('');
  var _c = useState(''),
    errorMessage = _c[0],
    setErrorMessage = _c[1];
  var getErrorMessage = function() {
    var errMessage = name && get(formContext, ['formErrors', name], '');
    var messageBar = errMessage
      ? React.createElement(
          MessageBar,
          {
            messageBarType: MessageBarType.error,
            isMultiline: false,
            dismissButtonAriaLabel: formatMessage('Close'),
            truncated: true,
            overflowButtonAriaLabel: formatMessage('See more'),
          },
          getDefaultErrorMessage(label + ' ' + errMessage)
        )
      : '';
    if (hiddenErrMessage) {
      onValidate && onValidate(messageBar);
      // return span so text field shows error border
      return errMessage ? React.createElement('span', null) : '';
    } else {
      return errMessage ? messageBar : '';
    }
  };
  useEffect(
    function() {
      setErrorMessage(getErrorMessage());
    },
    [formContext.formErrors, value]
  );
  var Field = editable ? EditableField : TextField;
  return React.createElement(
    React.Fragment,
    null,
    !hideLabel && !!label && React.createElement(WidgetLabel, { label: label, description: description, id: id }),
    React.createElement(
      Field,
      __assign({}, rest, {
        id: id,
        value: value,
        errorMessage: errorMessage,
        autoComplete: 'off',
        styles: {
          root: __assign({}, !hideLabel && !!label ? {} : { margin: '7px 0' }),
          errorMessage: {
            display: hiddenErrMessage ? 'none' : 'block',
            paddingTop: 0,
          },
        },
        options: options,
      })
    )
  );
};
//# sourceMappingURL=ExpressionWidget.js.map
