// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import React, { useState, useEffect } from 'react';
import { SelectableOptionMenuItemType, ComboBox } from 'office-ui-fabric-react/lib/ComboBox';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';
import { WidgetLabel } from './WidgetLabel';
var ADD_DIALOG = 'ADD_DIALOG';
export var DialogSelectWidget = function(props) {
  var formContext = props.formContext,
    onChange = props.onChange,
    onFocus = props.onFocus,
    onBlur = props.onBlur,
    value = props.value,
    id = props.id,
    placeholder = props.placeholder,
    label = props.label,
    schema = props.schema;
  var description = schema.description;
  var _a = useState(null),
    comboboxTitle = _a[0],
    setComboboxTitle = _a[1];
  useEffect(
    function() {
      // We have to wait until props get full updtated (value and dialogOptions) before
      // letting the combobox be controlled by value.
      if (
        comboboxTitle &&
        comboboxTitle === value &&
        (formContext.dialogOptions || []).find(function(d) {
          return d.value === value;
        })
      ) {
        setComboboxTitle(null);
      }
    },
    [comboboxTitle, value, formContext.dialogOptions]
  );
  var options = (formContext.dialogOptions || [])
    .filter(function(d) {
      return d.value !== formContext.currentDialog.id;
    })
    .map(function(d) {
      return {
        key: d.value,
        text: d.label,
        isSelected: value === d.value,
      };
    });
  options.push(
    { key: 'separator', itemType: SelectableOptionMenuItemType.Divider, text: '' },
    { key: ADD_DIALOG, text: formatMessage('Create a new dialog') }
  );
  if (comboboxTitle) {
    options.push({ key: 'customTitle', text: comboboxTitle });
  }
  var handleChange = function(e, option) {
    if (option) {
      if (option.key === ADD_DIALOG) {
        setComboboxTitle(formatMessage('Create a new dialog'));
        formContext.shellApi.createDialog({ actions: [] }).then(function(newDialog) {
          if (newDialog) {
            onChange(newDialog);
            setTimeout(function() {
              return formContext.shellApi.navTo(newDialog);
            }, 500);
          } else {
            setComboboxTitle(null);
          }
        });
      } else {
        onChange(option.key);
      }
    } else {
      onChange(null);
    }
  };
  var onRenderOption = function(option) {
    if (!option) {
      return null;
    }
    return React.createElement(
      'div',
      null,
      React.createElement(Icon, {
        iconName: option.key === ADD_DIALOG ? 'Add' : 'OpenSource',
        style: { marginRight: '8px' },
        'aria-hidden': 'true',
      }),
      React.createElement('span', null, option.text)
    );
  };
  // Using a Combobox allows us more control over invoking props.onChange via
  // onItemClick prop.
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(WidgetLabel, { label: label, description: description, id: id }),
    React.createElement(ComboBox, {
      id: id,
      placeholder: placeholder,
      onBlur: function() {
        return onBlur && onBlur(id, value);
      },
      onFocus: function() {
        return onFocus && onFocus(id, value);
      },
      options: options,
      selectedKey: comboboxTitle ? 'customTitle' : value || '',
      onItemClick: handleChange,
      onRenderOption: onRenderOption,
      autoComplete: 'off',
      useComboBoxAsMenuWidth: true,
    })
  );
};
//# sourceMappingURL=DialogSelectWidget.js.map
