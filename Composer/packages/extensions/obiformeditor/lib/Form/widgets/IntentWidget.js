// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { Dropdown, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import formatMessage from 'format-message';
import { WidgetLabel } from './WidgetLabel';
import LuEditorWidget from './LuEditorWidget';
var EMPTY_OPTION = { key: '', text: '' };
var RecognizerType;
(function(RecognizerType) {
  RecognizerType[(RecognizerType['regex'] = 0)] = 'regex';
  RecognizerType[(RecognizerType['luis'] = 1)] = 'luis';
})(RecognizerType || (RecognizerType = {}));
function recognizerType(currentDialog) {
  var recognizer = currentDialog.content.recognizer;
  if (!recognizer) {
    return null;
  }
  if (typeof recognizer === 'object' && recognizer.$type === 'Microsoft.RegexRecognizer') {
    return RecognizerType.regex;
  } else if (typeof recognizer === 'string') {
    return RecognizerType.luis;
  }
  return null;
}
function regexIntentOptions(currentDialog) {
  var recognizer = currentDialog.content.recognizer;
  var options = [EMPTY_OPTION];
  if (!recognizer) {
    return options;
  }
  if (recognizer.intents) {
    options = options.concat(
      recognizer.intents.map(function(i) {
        return { key: i.intent, text: i.intent };
      })
    );
  }
  return options;
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
  var options = [];
  var widgetLabel = label;
  var isLuisSelected = false;
  switch (recognizerType(currentDialog)) {
    case RecognizerType.regex:
      options = regexIntentOptions(currentDialog);
      isLuisSelected = false;
      break;
    case RecognizerType.luis:
      widgetLabel = 'Trigger phrases(intent name: #' + (value || '') + ')';
      isLuisSelected = true;
      break;
    default:
      options = [EMPTY_OPTION];
      isLuisSelected = false;
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
    React.createElement(WidgetLabel, { label: widgetLabel, description: description, id: id }),
    !isLuisSelected &&
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
      }),
    isLuisSelected &&
      React.createElement(LuEditorWidget, { formContext: formContext, onChange: onChange, name: value, height: 316 })
  );
};
//# sourceMappingURL=IntentWidget.js.map
