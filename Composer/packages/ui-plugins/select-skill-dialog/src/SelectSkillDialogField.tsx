// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FormEvent } from 'react';
import { FieldProps, useShellApi } from '@bfc/extension-client';
import formatMessage from 'format-message';
import { getSkillNameFromSetting, Skill } from '@bfc/shared';
import { Link } from 'office-ui-fabric-react/lib/components/Link/Link';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { FieldLabel } from '@bfc/adaptive-form';

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

  const options: IDropdownOption[] = [];
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

  const handleChange = (event: FormEvent<HTMLDivElement>, option?: IDropdownOption | undefined) => {
    if (option) {
      onChange({ ...value, ...option.data });
    }
  };

  return (
    <React.Fragment>
      <FieldLabel
        required
        description={formatMessage('Name of skill dialog to call')}
        id={'SkillDialogNameField'}
        label={formatMessage('Skill Dialog Name')}
      />
      <Dropdown
        disabled={Object.keys(skills).length === 0}
        id={'SkillDialogName'}
        options={options}
        selectedKey={skillNameIdentifier}
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
