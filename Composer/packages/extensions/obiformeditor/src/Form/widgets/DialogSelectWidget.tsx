import React, { useState, useEffect } from 'react';
import {
  SelectableOptionMenuItemType,
  ComboBox,
  IComboBoxOption,
  IRenderFunction,
  ISelectableOption,
  Icon,
} from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { BFDWidgetProps } from '../types';

const ADD_DIALOG = 'ADD_DIALOG';

export const DialogSelectWidget: React.FC<BFDWidgetProps> = props => {
  const { formContext, onChange, onFocus, onBlur, value, id, placeholder } = props;
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
        formContext.shellApi.createDialog().then(newDialog => {
          if (newDialog) {
            onChange(newDialog);
            setComboboxTitle(newDialog);
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
    <ComboBox
      id={id}
      placeholder={placeholder}
      onBlur={() => onBlur(id, value)}
      onFocus={() => onFocus(id, value)}
      options={options}
      selectedKey={comboboxTitle ? 'customTitle' : value || ''}
      onItemClick={handleChange}
      onRenderOption={onRenderOption}
      autoComplete="off"
      useComboBoxAsMenuWidth
    />
  );
};
