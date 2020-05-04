// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo } from 'react';
import { FieldProps, JSONSchema7, useShellApi } from '@bfc/extension';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { ObjectField, SchemaField } from '@bfc/adaptive-form';
import formatMessage from 'format-message';

import { SkillEndpointField } from './SkillEndpointField';

export const BeginSkillDialogField: React.FC<FieldProps> = props => {
  const { depth, id, schema, uiOptions, value, onChange, definitions } = props;
  const { projectId, skills = [] } = useShellApi();

  const manifest = useMemo(() => skills.find(({ manifestUrl }) => manifestUrl === value.id), [skills, value.id]);
  const endpointOptions = useMemo(() => (manifest?.endpoints || []).map(({ name }) => name), [manifest]);

  const handleIdChange = ({ key }) => {
    if (!manifest || key !== manifest.manifestUrl) {
      const { skillEndpoint, skillAppId, ...rest } = value;
      onChange({ ...rest, id: key });
    }
  };

  const handleEndpointChange = skillEndpoint => {
    const { msAppId } =
      (manifest?.endpoints || []).find(({ endpointUrl }) => endpointUrl === skillEndpoint) || ({} as any);
    onChange({ ...value, skillEndpoint, ...(msAppId ? { skillAppId: msAppId } : {}) });
  };

  const skillEndpointUiSchema = uiOptions.properties?.skillEndpoint || {};
  skillEndpointUiSchema.serializer = {
    get: value => {
      const endpoint = (manifest?.endpoints || []).find(({ endpointUrl }) => endpointUrl === value);
      return endpoint?.name;
    },
    set: value => {
      const endpoint = (manifest?.endpoints || []).find(({ name }) => name === value);
      return endpoint?.endpointUrl;
    },
  };

  return (
    <React.Fragment>
      <SchemaField
        depth={depth + 1}
        id={`${id}.id`}
        name="id"
        schema={(schema?.properties?.id as JSONSchema7) || {}}
        rawErrors={{}}
        uiOptions={uiOptions.properties?.id || {}}
        value={value?.id}
        onChange={handleIdChange}
        definitions={definitions}
      />
      <SkillEndpointField
        depth={depth + 1}
        id={`${id}.skillEndpoint`}
        name="skillEndpoint"
        schema={(schema?.properties?.skillEndpoint as JSONSchema7) || {}}
        enumOptions={endpointOptions}
        rawErrors={{}}
        uiOptions={skillEndpointUiSchema}
        value={value?.skillEndpoint}
        onChange={handleEndpointChange}
        definitions={definitions}
      />
      <Link href={`/bot/${projectId}/skills`} styles={{ root: { fontSize: '12px', padding: '0 16px' } }}>
        {formatMessage('Open Skills page for configuration details')}
      </Link>
      <ObjectField {...props} />
    </React.Fragment>
  );
};
