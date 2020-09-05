// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { IComboBoxOption, SelectableOptionMenuItemType } from 'office-ui-fabric-react/lib/ComboBox';
import { FieldProps, useShellApi } from '@bfc/extension';
import formatMessage from 'format-message';

import { ComboBoxField } from './ComboBoxField';

const ADD_DIALOG = 'ADD_DIALOG';

export const SelectSkillDialog: React.FC<FieldProps> = (props) => {
  const { value, onChange } = props;
  const { shellApi, skills = [] } = useShellApi();
  const { addSkillDialog, skillsInSettings } = shellApi;
  const [comboboxTitle, setComboboxTitle] = useState<string | null>(null);

  const options: IComboBoxOption[] = skills.map(({ name, manifestUrl }) => ({
    key: manifestUrl,
    text: name,
    isSelected: skillsInSettings.get(value) === manifestUrl,
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
        addSkillDialog().then((newSkill) => {
          if (newSkill && newSkill?.manifestUrl) {
            onChange({ key: newSkill.manifestUrl });
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

  return <ComboBoxField {...props} comboboxTitle={comboboxTitle} options={options} onChange={handleChange} />;
};
