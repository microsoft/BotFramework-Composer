// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState } from 'react';
import { IComboBoxOption, SelectableOptionMenuItemType } from 'office-ui-fabric-react/lib/ComboBox';
import { FieldProps, useShellApi } from '@bfc/extension-client';
import formatMessage from 'format-message';
import { IntellisenseTextField, WithTypeIcons } from '@bfc/adaptive-form';

import ComboBoxField, { ADD_DIALOG } from './ComboBoxField';

const IntellisenseTextFieldWithIcon = WithTypeIcons(IntellisenseTextField);

export const SelectDialog: React.FC<FieldProps> = (props) => {
  const { value = '', onBlur, onChange } = props;

  const {
    currentDialog: { id: currentDialogId },
    dialogs,
    shellApi,
  } = useShellApi();
  const { createDialog, navTo } = shellApi;
  const [comboboxTitle, setComboboxTitle] = useState<string | null>(null);
  const [showIntellisenseField, setShowIntellisenseField] = useState(!dialogs.find(({ id }) => id !== value));

  const options: IComboBoxOption[] = dialogs
    .filter(({ id }) => id !== currentDialogId)
    .map(({ displayName, id }) => ({
      key: id,
      text: displayName,
      isSelected: value === displayName,
    }));

  options.push(
    {
      key: 'separator',
      itemType: SelectableOptionMenuItemType.Divider,
      text: '',
    },
    {
      key: 'expression',
      text: formatMessage('Write an expression'),
    },
    { key: ADD_DIALOG, text: formatMessage('Create a new dialog') }
  );

  if (comboboxTitle) {
    options.push({ key: 'customTitle', text: comboboxTitle });
  }

  const handleChange = (_, option) => {
    if (option) {
      if (option.key === ADD_DIALOG) {
        setComboboxTitle(formatMessage('Create a new dialog'));
        createDialog([]).then((newDialog) => {
          if (newDialog) {
            onChange(newDialog);
            setTimeout(() => navTo(newDialog), 500);
          } else {
            setComboboxTitle(null);
          }
        });
      } else {
        if (option.key === 'expression') {
          setShowIntellisenseField(true);
          onChange('');
        } else {
          onChange(option.key);
        }
      }
    } else {
      onChange(null);
    }
  };

  const blur = useCallback(
    (id, currentValue) => {
      onBlur?.(id, currentValue);
      if (!value) {
        setShowIntellisenseField(false);
      }
    },
    [value, onBlur]
  );

  return showIntellisenseField ? (
    <IntellisenseTextFieldWithIcon {...props} onBlur={blur} />
  ) : (
    <ComboBoxField {...props} comboboxTitle={comboboxTitle} options={options} onChange={handleChange} />
  );
};
