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

  const skillId = getSkillNameFromSetting(value?.skillEndpoint);
  const { manifest, name }: Skill = skills[skillId] || {};

  const options: IComboBoxOption[] = [];
  for (const skillNameIdentifier in skills) {
    const skill = skills[skillNameIdentifier];
    const option = {
      key: skillNameIdentifier,
      text: skill.name,
      data: settingReferences(skillNameIdentifier),
      isSelected: skillNameIdentifier === skillId,
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
        value={skillId}
        onChange={handleChange}
      />
      <Link
        disabled={!manifest || !name}
        styles={{ root: { fontSize: '12px', paddingTop: '4px' } }}
        onClick={() => manifest && displayManifestModal(name)}
      >
        {formatMessage('Show skill manifest')}
      </Link>
    </React.Fragment>
  );
};
