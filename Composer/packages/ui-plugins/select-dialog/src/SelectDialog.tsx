// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { IComboBoxOption, SelectableOptionMenuItemType } from 'office-ui-fabric-react/lib/ComboBox';
import { FieldProps, useShellApi } from '@bfc/editor-extension';
import formatMessage from 'format-message';

import ComboBoxField, { ADD_DIALOG } from './ComboBoxField';

export const SelectDialog: React.FC<FieldProps> = (props) => {
  const { value = '', onChange } = props;

  const {
    currentDialog: { id: currentDialogId },
    dialogs,
    shellApi,
  } = useShellApi();
  const { createDialog, navTo } = shellApi;
  const [comboboxTitle, setComboboxTitle] = useState<string | null>(null);

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
        onChange(option.key);
      }
    } else {
      onChange(null);
    }
  };

  return <ComboBoxField {...props} comboboxTitle={comboboxTitle} options={options} onChange={handleChange} />;
};
