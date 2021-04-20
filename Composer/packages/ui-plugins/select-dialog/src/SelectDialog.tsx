// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useCallback, useState, useMemo } from 'react';
import { IContextualMenuItem } from 'office-ui-fabric-react/lib/ContextualMenu';
import { FieldProps, useShellApi } from '@bfc/extension-client';
import formatMessage from 'format-message';
import { IntellisenseTextField, WithTypeIcons } from '@bfc/adaptive-form';

import ComboBoxField, { ADD_DIALOG } from './SelectDialogMenu';

const IntellisenseTextFieldWithIcon = WithTypeIcons(IntellisenseTextField);

export const SelectDialog: React.FC<FieldProps> = (props) => {
  const { value = '', onBlur, onChange } = props;

  const { currentDialog, dialogs, topics, shellApi } = useShellApi();
  const { createDialog, navTo } = shellApi;
  const [comboboxTitle, setComboboxTitle] = useState<string | null>(null);
  const isDialogSelected = useMemo(() => {
    return Boolean(dialogs.find(({ id }) => id === value) || topics.find(({ content }) => content?.id === value));
  }, [value, dialogs, topics]);
  // if there is no dialog selected but there is a value, show the intellisense field
  const [showIntellisenseField, setShowIntellisenseField] = useState(!isDialogSelected && value.length > 0);
  const dialogsWithoutCurrent = useMemo(() => {
    return dialogs.filter((d) => d.id !== currentDialog?.id);
  }, [dialogs.map((d) => d.id)]);

  const handleChange = (_, item?: IContextualMenuItem) => {
    if (item) {
      if (item.key === ADD_DIALOG) {
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
        if (item.key === 'expression') {
          setShowIntellisenseField(true);
          onChange('');
        } else {
          onChange(item.key);
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
    <ComboBoxField
      {...props}
      comboboxTitle={comboboxTitle}
      dialogs={dialogsWithoutCurrent}
      topics={topics}
      onChange={handleChange}
    />
  );
};
