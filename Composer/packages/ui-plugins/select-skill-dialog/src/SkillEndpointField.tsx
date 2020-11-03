// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { FieldProps, useShellApi } from '@bfc/extension-client';
import { FieldLabel } from '@bfc/adaptive-form';
import { getSkillNameFromSetting, Skill, VIRTUAL_LOCAL_ENDPOINT } from '@bfc/shared';
import { SelectableOptionMenuItemType } from 'office-ui-fabric-react/lib/ComboBox';

export const SkillEndpointField: React.FC<FieldProps> = (props) => {
  const { description, label, required, uiOptions, value } = props;
  const { shellApi, skillsSettings, skills } = useShellApi();
  const { updateSkill } = shellApi;

  const id = getSkillNameFromSetting(value?.skillEndpoint);
  const skill: Skill = skills[id] || {};

  const { endpointUrl: endpointUrlInSettings, msAppId: msAppIdInSettings } = skillsSettings[id] || {};

  const endpoints = skill?.manifest?.endpoints || [];

  const options = useMemo(() => {
    const endpointsInManifest: any[] = endpoints.map(({ name, endpointUrl, msAppId }, key) => ({
      key,
      text: name,
      data: {
        endpointUrl,
        msAppId,
        name,
      },
      isManifestEndpoint: true,
    }));

    let localEndpoint: any[] = [];
    if (Object.keys(skills).length > 0) {
      if (!skill.remote) {
        localEndpoint = [
          {
            key: 'localEndpointHeader',
            itemType: SelectableOptionMenuItemType.Header,
            text: 'Local Endpoints',
          },
          {
            key: -1,
            text: VIRTUAL_LOCAL_ENDPOINT.name,
            data: {
              endpointUrl: endpointUrlInSettings,
              msAppId: msAppIdInSettings,
              name: VIRTUAL_LOCAL_ENDPOINT.name,
            },
          },
        ];
      }
      if (endpointsInManifest.length > 0) {
        endpointsInManifest.unshift({
          key: 'remoteEndpointHeader',
          itemType: SelectableOptionMenuItemType.Header,
          text: 'Manifest Endpoints',
        });
      }
    }

    return [...localEndpoint, ...endpointsInManifest];
  }, [endpoints]);

  const { key } = options.find(({ data, isManifestEndpoint }) => {
    return isManifestEndpoint && data?.endpointUrl === endpointUrlInSettings && data?.msAppId === msAppIdInSettings;
  }) || { key: -1 };

  const handleChange = (_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
    if (option) {
      updateSkill(id, { skill: { ...skill }, selectedEndpointIndex: Number(option.key) });
    }
  };

  return (
    <React.Fragment>
      <FieldLabel description={description} helpLink={uiOptions?.helpLink} id={id} label={label} required={required} />
      <Dropdown disabled={!skill.id} options={options} selectedKey={key} onChange={handleChange} />
    </React.Fragment>
  );
};
