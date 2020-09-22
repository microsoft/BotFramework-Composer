// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useMemo, useState, useEffect } from 'react';
import { FieldProps, JSONSchema7, useShellApi } from '@bfc/extension-client';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { ObjectField } from '@bfc/adaptive-form';
import formatMessage from 'format-message';
import { Skill, getSkillNameFromSetting } from '@bfc/shared';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';

import { SelectSkillDialog } from './SelectSkillDialogField';
import { SkillEndpointField } from './SkillEndpointField';

const referBySettings = (skillName: string, property: string) => {
  return `=settings.skill['${skillName}'].${property}`;
};

const settingReferences = (skillName: string) => ({
  skillEndpoint: referBySettings(skillName, 'endpointUrl'),
  skillAppId: referBySettings(skillName, 'msAppId'),
});

const handleBackwardCompatibility = (skills: Skill[], value): { name: string; endpointName: string } | undefined => {
  const { skillEndpoint } = value;
  const foundSkill = skills.find(({ manifestUrl }) => manifestUrl === value.id);
  if (foundSkill) {
    const matchedEndpoint: any = foundSkill.endpoints.find(({ endpointUrl }) => endpointUrl === skillEndpoint);
    return {
      name: foundSkill?.name,
      endpointName: matchedEndpoint ? matchedEndpoint.name : '',
    };
  }
};

export const BeginSkillDialogField: React.FC<FieldProps> = (props) => {
  const { depth, id, schema, uiOptions, value, onChange, definitions } = props;
  const { projectId, shellApi, skills = [] } = useShellApi();
  const { displayManifestModal, skillsSettings } = shellApi;
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [oldEndpoint, loadEndpointForOldBots] = useState<string>('');

  useEffect(() => {
    const { skillEndpoint } = value;
    const skill = skills.find(({ name }) => name === getSkillNameFromSetting(skillEndpoint));

    if (skill) {
      setSelectedSkill(skill.name);
    } else {
      const result = handleBackwardCompatibility(skills, value);
      if (result) {
        setSelectedSkill(result.name);
        if (result.endpointName) {
          loadEndpointForOldBots(result.endpointName);
        }
      }
    }
  }, []);

  const matchedSkill = useMemo(() => {
    return skills.find(({ id }) => id === selectedSkill) || ({} as Skill);
  }, [skills, selectedSkill]);

  const endpointOptions = useMemo(() => {
    return (matchedSkill.endpoints || []).map(({ name }) => name);
  }, [matchedSkill]);

  const handleEndpointChange = async (skillEndpoint) => {
    if (matchedSkill.id) {
      const { msAppId, endpointUrl } =
        (matchedSkill.endpoints || []).find(({ name }) => name === skillEndpoint) || ({} as any);
      const schemaUpdate: any = {};
      const settingsUpdate: any = { ...matchedSkill };
      if (endpointUrl) {
        schemaUpdate.skillEndpoint = referBySettings(matchedSkill.name, 'endpointUrl');
        settingsUpdate.endpointUrl = endpointUrl;
      }
      if (msAppId) {
        schemaUpdate.skillAppId = referBySettings(matchedSkill.name, 'msAppId');
        settingsUpdate.msAppId = msAppId;
      }
      skillsSettings.set(matchedSkill.id, { ...settingsUpdate });
      onChange({
        ...value,
        ...schemaUpdate,
      });
    }
  };

  useEffect(() => {
    if (oldEndpoint) {
      handleEndpointChange(oldEndpoint);
    }
  }, [oldEndpoint]);

  const handleShowManifestClick = () => {
    matchedSkill && displayManifestModal(matchedSkill.manifestUrl);
  };

  const skillEndpointUiSchema = uiOptions.properties?.skillEndpoint || {};
  skillEndpointUiSchema.serializer = {
    get: (value) => {
      const url: any = skillsSettings.get(value);
      const endpoint = (matchedSkill?.endpoints || []).find(({ endpointUrl }) => endpointUrl === url);
      return endpoint?.name;
    },
    set: (value) => {
      const endpoint = (matchedSkill?.endpoints || []).find(({ name }) => name === value);
      return endpoint?.endpointUrl;
    },
  };

  const onSkillSelectionChange = (option: IComboBoxOption | null) => {
    if (option?.text) {
      setSelectedSkill(option.text);
      onChange({ ...value, ...settingReferences(option.text) });
    }
  };

  return (
    <React.Fragment>
      <SelectSkillDialog value={selectedSkill} onChange={onSkillSelectionChange} />
      <Link
        disabled={!matchedSkill || !matchedSkill.content || !matchedSkill.name}
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
