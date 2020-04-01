// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { Dropdown, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import { WidgetLabel } from './WidgetLabel';
import { LuEditorWidget } from './LuEditorWidget';
import { RegexEditorWidget } from './RegexEditorWidget';
var EMPTY_OPTION = { key: '', text: '' };
var RecognizerType;
(function(RecognizerType) {
  RecognizerType[(RecognizerType['none'] = 0)] = 'none';
  RecognizerType[(RecognizerType['regex'] = 1)] = 'regex';
  RecognizerType[(RecognizerType['luis'] = 2)] = 'luis';
})(RecognizerType || (RecognizerType = {}));
function recognizerType(_a) {
  var content = _a.content;
  var recognizer = content.recognizer;
  if (recognizer) {
    if (typeof recognizer === 'object' && recognizer.$type === 'Microsoft.RegexRecognizer') {
      return RecognizerType.regex;
    } else if (typeof recognizer === 'string') {
      return RecognizerType.luis;
    }
  }
  return RecognizerType.none;
}
export var IntentWidget = function(props) {
  var disabled = props.disabled,
    onChange = props.onChange,
    id = props.id,
    onFocus = props.onFocus,
    onBlur = props.onBlur,
    value = props.value,
    formContext = props.formContext,
    placeholder = props.placeholder,
    label = props.label,
    schema = props.schema;
  var description = schema.description;
  var currentDialog = formContext.currentDialog;
  var type = recognizerType(currentDialog);
  var options = [];
  switch (type) {
    case RecognizerType.regex:
    case RecognizerType.luis:
      break;
    default:
      options = [EMPTY_OPTION];
      break;
  }
  var handleChange = function(_e, option) {
    if (option) {
      onChange(option.key);
    }
  };
  return React.createElement(
    React.Fragment,
    null,
    type === RecognizerType.none &&
      React.createElement(
        React.Fragment,
        null,
        React.createElement(WidgetLabel, { label: label, description: description, id: id }),
        React.createElement(Dropdown, {
          id: id.replace(/\.|#/g, ''),
          onBlur: function() {
            return onBlur && onBlur(id, value);
          },
          onChange: handleChange,
          onFocus: function() {
            return onFocus && onFocus(id, value);
          },
          options: options,
          selectedKey: value || null,
          responsiveMode: ResponsiveMode.large,
          disabled: disabled || options.length === 1,
          placeholder: options.length > 1 ? placeholder : formatMessage('No intents configured for this dialog'),
        })
      ),
    type === RecognizerType.luis &&
      React.createElement(LuEditorWidget, { formContext: formContext, name: value, height: 316 }),
    type === RecognizerType.regex && React.createElement(RegexEditorWidget, { formContext: formContext, name: value })
  );
};
//# sourceMappingURL=IntentWidget.js.map
