// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import { IComboBoxOption, SelectableOptionMenuItemType } from 'office-ui-fabric-react/lib/ComboBox';
import { useShellApi } from '@bfc/extension';
import formatMessage from 'format-message';
import { schemaField } from '@bfc/adaptive-form';

import { ComboBoxField } from './ComboBoxField';

const ADD_DIALOG = 'ADD_DIALOG';

export const SelectSkillDialog: React.FC<{
  value: string;
  depth: number;
  onChange: (option: IComboBoxOption | null) => void;
}> = (props) => {
  const { value, onChange, depth } = props;
  const { shellApi, skills = [] } = useShellApi();
  const { addSkillDialog } = shellApi;
  const [comboboxTitle, setComboboxTitle] = useState<string | null>(null);

  const options: IComboBoxOption[] = skills.map(({ name }) => ({
    key: name,
    text: name,
    isSelected: value === name,
  }));

  options.push(
    {
      key: 'separator',
      itemType: SelectableOptionMenuItemType.Divider,
      text: '',
    },
    { key: ADD_DIALOG, text: formatMessage('Add a new Skill Dialog') }
  );

  if (comboboxTitle) {
    options.push({ key: 'customTitle', text: comboboxTitle });
  }

  const handleChange = (_, option) => {
    if (option) {
      if (option.key === ADD_DIALOG) {
        setComboboxTitle(formatMessage('Add a new Skill Dialog'));
        addSkillDialog().then((skill) => {
          if (skill?.manifestUrl && skill?.name) {
            onChange({ key: skill?.manifestUrl, text: skill?.name });
          }
          setComboboxTitle(null);
        });
      } else {
        onChange(option);
      }
    } else {
      onChange(null);
    }
  };

  return (
    <div css={schemaField.container(depth)}>
      <ComboBoxField
        comboboxTitle={comboboxTitle}
        description={formatMessage('Name of skill dialog to call')}
        id={'SkillDialogName'}
        label={formatMessage('Skill Dialog Name')}
        options={options}
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};
