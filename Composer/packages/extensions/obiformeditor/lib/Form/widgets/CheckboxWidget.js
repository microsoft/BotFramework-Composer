// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox';
import { WidgetLabel } from './WidgetLabel';
export function CheckboxWidget(props) {
  var onChange = props.onChange,
    onBlur = props.onBlur,
    onFocus = props.onFocus,
    value = props.value,
    label = props.label,
    id = props.id,
    schema = props.schema;
  var description = schema.description;
  return React.createElement(
    'div',
    { style: { display: 'flex', alignItems: 'center', marginTop: '14px' } },
    React.createElement(Checkbox, {
      id: id,
      checked: Boolean(value),
      onChange: function(_, checked) {
        return onChange(checked);
      },
      onBlur: function() {
        return onBlur && onBlur(id, Boolean(value));
      },
      onFocus: function() {
        return onFocus && onFocus(id, Boolean(value));
      },
      ariaLabel: label,
    }),
    React.createElement(WidgetLabel, { label: label, description: description, id: id, inline: true })
  );
}
CheckboxWidget.defaultProps = {
  schema: {},
  options: {},
};
//# sourceMappingURL=CheckboxWidget.js.map
