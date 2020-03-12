// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useEffect } from 'react';
import { SelectableOptionMenuItemType, ComboBox, IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import { ISelectableOption } from 'office-ui-fabric-react/lib/utilities/selectableOption';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import formatMessage from 'format-message';

import { BFDWidgetProps } from '../types';

import { WidgetLabel } from './WidgetLabel';

const ADD_DIALOG = 'ADD_DIALOG';

export const DialogSelectWidget: React.FC<BFDWidgetProps> = props => {
  const { formContext, onChange, onFocus, onBlur, value, id, placeholder, label, schema } = props;
  const { description } = schema;
  const [comboboxTitle, setComboboxTitle] = useState<string | null>(null);

  useEffect(() => {
    // We have to wait until props get full updtated (value and dialogOptions) before
    // letting the combobox be controlled by value.
    if (comboboxTitle && comboboxTitle === value && (formContext.dialogOptions || []).find(d => d.value === value)) {
      setComboboxTitle(null);
    }
  }, [comboboxTitle, value, formContext.dialogOptions]);

  const options: IComboBoxOption[] = (formContext.dialogOptions || [])
    .filter(d => d.value !== formContext.currentDialog.id)
    .map(d => ({
      key: d.value,
      text: d.label,
      isSelected: value === d.value,
    }));

  options.push(
    { key: 'separator', itemType: SelectableOptionMenuItemType.Divider, text: '' },
    { key: ADD_DIALOG, text: formatMessage('Create a new dialog') }
  );

  if (comboboxTitle) {
    options.push({ key: 'customTitle', text: comboboxTitle });
  }

  const handleChange = (e, option) => {
    if (option) {
      if (option.key === ADD_DIALOG) {
        setComboboxTitle(formatMessage('Create a new dialog'));
        formContext.shellApi.createDialog({ actions: [] }).then(newDialog => {
          if (newDialog) {
            onChange(newDialog);
            setTimeout(() => formContext.shellApi.navTo(newDialog), 500);
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

  const onRenderOption: IRenderFunction<ISelectableOption> = option => {
    if (!option) {
      return null;
    }

    return (
      <div>
        <Icon
          iconName={option.key === ADD_DIALOG ? 'Add' : 'OpenSource'}
          style={{ marginRight: '8px' }}
          aria-hidden="true"
        />
        <span>{option.text}</span>
      </div>
    );
  };

  // Using a Combobox allows us more control over invoking props.onChange via
  // onItemClick prop.
  return (
    <>
      <WidgetLabel label={label} description={description} id={id} />
      <ComboBox
        id={id}
        placeholder={placeholder}
        onBlur={() => onBlur && onBlur(id, value)}
        onFocus={() => onFocus && onFocus(id, value)}
        options={options}
        selectedKey={comboboxTitle ? 'customTitle' : value || ''}
        onItemClick={handleChange}
        onRenderOption={onRenderOption}
        autoComplete="off"
        useComboBoxAsMenuWidth
      />
    </>
  );
};
