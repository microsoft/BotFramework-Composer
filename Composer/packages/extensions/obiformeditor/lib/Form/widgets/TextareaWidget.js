// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { WidgetLabel } from './WidgetLabel';
export var TextareaWidget = function(props) {
  var onBlur = props.onBlur,
    onChange = props.onChange,
    onFocus = props.onFocus,
    readonly = props.readonly,
    value = props.value,
    placeholder = props.placeholder,
    schema = props.schema,
    id = props.id,
    disabled = props.disabled,
    label = props.label;
  var description = schema.description,
    _a = schema.examples,
    examples = _a === void 0 ? [] : _a;
  var placeholderText = placeholder;
  if (!placeholderText && examples.length > 0) {
    placeholderText = 'ex. ' + examples.join(', ');
  }
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(WidgetLabel, { label: label, description: description, id: id }),
    React.createElement(TextField, {
      disabled: disabled,
      id: id,
      multiline: true,
      onBlur: function() {
        return onBlur && onBlur(id, value);
      },
      onChange: function(_, newValue) {
        return onChange(newValue);
      },
      onFocus: function() {
        return onFocus && onFocus(id, value);
      },
      placeholder: placeholderText,
      readOnly: readonly,
      value: value,
      styles: {
        subComponentStyles: {
          label: { root: { fontSize: '12px', fontWeight: '400' } },
        },
      },
    })
  );
};
TextareaWidget.defaultProps = {
  schema: {},
  options: {},
  onBlur: function() {},
  onFocus: function() {},
};
//# sourceMappingURL=TextareaWidget.js.map
