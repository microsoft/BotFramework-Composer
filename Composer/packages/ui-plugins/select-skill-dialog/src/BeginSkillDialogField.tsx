// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import { FieldProps, JSONSchema7, useShellApi } from '@bfc/extension';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { ObjectField, SchemaField } from '@bfc/adaptive-form';
import formatMessage from 'format-message';
import { Skill } from '@bfc/shared';

import { SkillEndpointField } from './SkillEndpointField';

export const BeginSkillDialogField: React.FC<FieldProps> = (props) => {
  const { depth, id, schema, uiOptions, value, onChange, definitions } = props;
  const { projectId, shellApi, skills = [] } = useShellApi();
  const { displayManifestModal, skillsInSettings } = shellApi;

  const manifest: Skill | undefined = useMemo(
    () =>
      skills.find(({ manifestUrl }) => {
        debugger;
        console.log(manifestUrl);
        return manifestUrl === skillsInSettings.get(value.id);
      }),
    [skills, value.id]
  );

  const endpointOptions = useMemo(() => {
    return (manifest?.endpoints || []).map(({ name }) => name);
  }, [manifest]);

  const handleIdChange = ({ key, text }) => {
    if (!manifest || key !== manifest.manifestUrl) {
      const { skillEndpoint, skillAppId, ...rest } = value;

      onChange({ ...rest, id: `=settings.skill['${text}'].manifestUrl` });
    }
  };

  const handleEndpointChange = async (skillEndpoint) => {
    const { msAppId, endpointUrl } =
      (manifest?.endpoints || []).find(({ name }) => name === skillEndpoint) || ({} as any);
    if (manifest?.name) {
      skillsInSettings.set(manifest.name, { endpointUrl, msAppId });
      onChange({
        ...value,
        skillEndpoint: `=settings.skill['${manifest?.name}'].endpointUrl`,
        ...(msAppId ? { skillAppId: `=settings.skill['${manifest.name}'].msAppId` } : {}),
      });
    }
  };

  const handleShowManifestClick = () => {
    value.id && displayManifestModal(value.id);
  };

  const skillEndpointUiSchema = uiOptions.properties?.skillEndpoint || {};
  skillEndpointUiSchema.serializer = {
    get: (value) => {
      const url: any = skillsInSettings.get(value);
      const endpoint = (manifest?.endpoints || []).find(({ endpointUrl }) => endpointUrl === url);
      return endpoint?.name;
    },
    set: (value) => {
      const endpoint = (manifest?.endpoints || []).find(({ name }) => name === value);
      return endpoint?.endpointUrl;
    },
  };

  return (
    <React.Fragment>
      <SchemaField
        definitions={definitions}
        depth={depth + 1}
        id={`${id}.id`}
        name="id"
        rawErrors={{}}
        schema={(schema?.properties?.id as JSONSchema7) || {}}
        uiOptions={uiOptions.properties?.id || {}}
        value={value?.id}
        onChange={handleIdChange}
      />
      <Link
        disabled={!manifest || !manifest.body || !manifest.name}
        styles={{ root: { fontSize: '12px', padding: '0 16px' } }}
        onClick={handleShowManifestClick}
      >
        {formatMessage('Show skill manifest')}
      </Link>
      <SkillEndpointField
        definitions={definitions}
        depth={depth + 1}
        enumOptions={endpointOptions}
        id={`${id}.skillEndpoint`}
        name="skillEndpoint"
        rawErrors={{}}
        schema={(schema?.properties?.skillEndpoint as JSONSchema7) || {}}
        uiOptions={skillEndpointUiSchema}
        value={value?.skillEndpoint}
        onChange={handleEndpointChange}
      />
      <Link href={`/bot/${projectId}/skills`} styles={{ root: { fontSize: '12px', padding: '0 16px' } }}>
        {formatMessage('Open Skills page for configuration details')}
      </Link>
      <ObjectField {...props} />
    </React.Fragment>
  );
};
