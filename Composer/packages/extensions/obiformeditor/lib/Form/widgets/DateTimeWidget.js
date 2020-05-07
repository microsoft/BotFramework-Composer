// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { DatePicker } from 'office-ui-fabric-react/lib/DatePicker';
import { WidgetLabel } from './WidgetLabel';
export function DateTimeWidget(props) {
  var onChange = props.onChange,
    onBlur = props.onBlur,
    onFocus = props.onFocus,
    required = props.required,
    value = props.value,
    label = props.label,
    id = props.id,
    schema = props.schema;
  var description = schema.description;
  var onSelectDate = function(date) {
    onChange(date ? date.toISOString() : null);
  };
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(WidgetLabel, { label: label, description: description, id: id }),
    React.createElement(DatePicker, {
      id: id,
      isRequired: required,
      onBlur: function() {
        return onBlur && onBlur(id, value);
      },
      onFocus: function() {
        return onFocus && onFocus(id, value);
      },
      onSelectDate: onSelectDate,
      value: value ? new Date(value) : undefined,
    })
  );
}
DateTimeWidget.defaultProps = {
  schema: {},
};
//# sourceMappingURL=DateTimeWidget.js.map
