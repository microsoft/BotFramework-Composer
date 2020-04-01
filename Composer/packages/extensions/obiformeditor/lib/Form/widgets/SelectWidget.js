// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { ResponsiveMode } from 'office-ui-fabric-react/lib/utilities/decorators/withResponsiveMode';
import { WidgetLabel } from './WidgetLabel';
export var SelectWidget = function(props) {
  var onChange = props.onChange,
    onFocus = props.onFocus,
    onBlur = props.onBlur,
    value = props.value,
    options = props.options,
    label = props.label,
    schema = props.schema,
    id = props.id,
    hideLabel = props.hideLabel;
  var description = schema.description;
  var handleChange = function(_, option) {
    if (option) {
      onChange(option.key);
    } else {
      onChange(null);
    }
  };
  return React.createElement(
    React.Fragment,
    null,
    !hideLabel && React.createElement(WidgetLabel, { label: label, description: description, id: id }),
    React.createElement(Dropdown, {
      id: id,
      onBlur: function() {
        return onBlur && onBlur(id, value);
      },
      onChange: handleChange,
      onFocus: function() {
        return onFocus && onFocus(id, value);
      },
      options: options.enumOptions.map(function(o) {
        return {
          key: o.value,
          text: o.label,
        };
      }),
      selectedKey: value,
      responsiveMode: ResponsiveMode.large,
      styles: {
        label: { fontSize: '10px', fontWeight: '400' },
      },
    })
  );
};
SelectWidget.defaultProps = {
  schema: {},
  onBlur: function() {},
  onFocus: function() {},
};
//# sourceMappingURL=SelectWidget.js.map
