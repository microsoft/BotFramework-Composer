// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';
import { FieldProps, useShellApi } from '@bfc/extension-client';
import formatMessage from 'format-message';
import { getSkillNameFromSetting, Skill } from '@bfc/shared';
import { Link } from 'office-ui-fabric-react/lib/components/Link/Link';

import { ComboBoxField } from './ComboBoxField';

const referBySettings = (skillName: string, property: string) => {
  return `=settings.skill['${skillName}'].${property}`;
};

export const settingReferences = (skillName: string) => ({
  skillEndpoint: referBySettings(skillName, 'endpointUrl'),
  skillAppId: referBySettings(skillName, 'msAppId'),
});

export const SelectSkillDialogField: React.FC<FieldProps> = (props) => {
  const { value, onChange } = props;

  const { shellApi, skills } = useShellApi();
  const { displayManifestModal } = shellApi;

  const skillNameIdentifier = getSkillNameFromSetting(value?.skillEndpoint);
  const { manifest, name }: Skill = skills[skillNameIdentifier] || {};

  const options: IComboBoxOption[] = [];
  for (const key in skills) {
    const skill = skills[key];
    const option = {
      key: key,
      text: skill.name,
      data: settingReferences(key),
      isSelected: key === skillNameIdentifier,
    };
    options.push(option);
  }

  const handleChange = (_, option: IComboBoxOption) => {
    if (option) {
      onChange({ ...value, ...option.data });
    }
  };

  return (
    <React.Fragment>
      <ComboBoxField
        description={formatMessage('Name of skill dialog to call')}
        id={'SkillDialogName'}
        label={formatMessage('Skill Dialog Name')}
        options={options}
        value={skillNameIdentifier}
        onChange={handleChange}
      />
      <Link
        disabled={!skillNameIdentifier || !manifest || !name}
        styles={{ root: { fontSize: '12px', paddingTop: '4px' } }}
        onClick={() => manifest && displayManifestModal(skillNameIdentifier)}
      >
        {formatMessage('Show skill manifest')}
      </Link>
    </React.Fragment>
  );
};
