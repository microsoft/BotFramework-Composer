/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
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
