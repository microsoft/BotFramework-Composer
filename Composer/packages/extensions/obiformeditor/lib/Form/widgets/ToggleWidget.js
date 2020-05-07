// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { Toggle } from 'office-ui-fabric-react/lib/Toggle';
import { WidgetLabel } from './WidgetLabel';
export function ToggleWidget(props) {
  var label = props.label,
    onChange = props.onChange,
    value = props.value,
    id = props.id,
    schema = props.schema;
  var description = schema.description;
  var handleChange = function(e, val) {
    onChange(val);
  };
  return React.createElement(
    'div',
    { style: { display: 'flex', alignItems: 'center', marginTop: '14px' } },
    React.createElement(Toggle, {
      id: id,
      checked: value,
      onChange: handleChange,
      styles: { root: { marginBottom: '0' } },
    }),
    React.createElement(WidgetLabel, { label: label, description: description, id: id, inline: true })
  );
}
//# sourceMappingURL=ToggleWidget.js.map
