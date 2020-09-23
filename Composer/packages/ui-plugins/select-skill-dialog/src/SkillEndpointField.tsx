// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { FieldProps, useShellApi } from '@bfc/extension-client';
import { getSkillNameFromSetting, Skill } from '@bfc/shared';

export const SkillEndpointField: React.FC<FieldProps> = ({ value }) => {
  const { shellApi, skillsSettings, skills = [] } = useShellApi();
  const { updateSkillSetting } = shellApi;

  const id = getSkillNameFromSetting(value.skillEndpoint);
  const skill = skills.find(({ id: skillId }) => skillId === id) || ({} as Skill);
  const { endpointUrl, msAppId } = skillsSettings[id] || {};

  const { endpoints = [] } = skill;

  const options = useMemo(
    () =>
      endpoints.map(({ name, endpointUrl, msAppId }, key) => ({
        key,
        text: name,
        data: {
          endpointUrl,
          msAppId,
        },
      })),
    [endpoints]
  );

  const { key } = options.find(({ data }) => data.endpointUrl === endpointUrl && data.msAppId === msAppId) || {};

  const handleChange = (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option) {
      updateSkillSetting(skill.id, { ...skill, ...option.data });
    }
  };

  return <Dropdown options={options} selectedKey={key} onChange={handleChange} />;
};
