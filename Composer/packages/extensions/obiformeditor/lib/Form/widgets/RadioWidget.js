// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React from 'react';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { WidgetLabel } from './WidgetLabel';
export function RadioWidget(props) {
  var label = props.label,
    onChange = props.onChange,
    onBlur = props.onBlur,
    onFocus = props.onFocus,
    value = props.value,
    options = props.options,
    id = props.id,
    schema = props.schema;
  var description = schema.description;
  var choices = (options.enumOptions || []).map(function(o) {
    return {
      key: o.value,
      text: o.label,
    };
  });
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(WidgetLabel, { label: label, description: description, id: id }),
    React.createElement(ChoiceGroup, {
      id: id,
      onBlur: function() {
        return onBlur && onBlur(id, value);
      },
      onChange: function(e, option) {
        return onChange(option ? option.key : null);
      },
      onFocus: function() {
        return onFocus && onFocus(id, value);
      },
      options: choices,
      selectedKey: value,
    })
  );
}
//# sourceMappingURL=RadioWidget.js.map
