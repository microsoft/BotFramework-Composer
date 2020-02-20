// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { ComboBox, IComboBoxOption, SelectableOptionMenuItemType } from 'office-ui-fabric-react/lib/ComboBox';
import { FieldLabel } from '@bfc/adaptive-form';
import { FieldProps, useShellApi } from '@bfc/extension';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { ISelectableOption } from 'office-ui-fabric-react/lib/utilities/selectableOption';
import { IRenderFunction } from 'office-ui-fabric-react/lib/Utilities';
import formatMessage from 'format-message';

const ADD_DIALOG = 'ADD_DIALOG';

export const SelectDialog: React.FC<FieldProps> = ({
  description,
  id,
  label,
  onBlur,
  onChange,
  onFocus,
  value = '',
}) => {
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
        createDialog().then(newDialog => {
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

  const onRenderOption: IRenderFunction<ISelectableOption> = option =>
    option ? (
      <div>
        <Icon
          aria-hidden="true"
          iconName={option.key === ADD_DIALOG ? 'Add' : 'OpenSource'}
          style={{ marginRight: '8px' }}
        />
        <span>{option.text}</span>
      </div>
    ) : null;

  return (
    <React.Fragment>
      <FieldLabel description={description} id={id} label={label} />
      <ComboBox
        autoComplete="off"
        id={id}
        options={options}
        selectedKey={comboboxTitle ? 'customTitle' : value}
        useComboBoxAsMenuWidth
        onBlur={() => onBlur && onBlur(id, value)}
        onFocus={() => onFocus && onFocus(id, value)}
        onItemClick={handleChange}
        onRenderOption={onRenderOption}
      />
    </React.Fragment>
  );
};
