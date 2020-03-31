// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, FormEvent } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';

import { ISkill, ISkillByAppConfig, ISkillByManifestUrl } from './types';

export interface ISkillFormProps {
  formData: ISkillByAppConfig | ISkillByManifestUrl | {};
  skills: ISkill[];
  onSubmit: (skillFormData: ISkillByAppConfig | ISkillByManifestUrl) => void;
  onDismiss: () => void;
}

const defaultFormData = {
  name: '',
  description: '',
  endpointUrl: '',
  msAppId: '',
};

const addOptions: IChoiceGroupOption[] = [
  { key: 'url', text: 'Add by manifest url' },
  { key: 'appConfig', text: 'Add by App configurations' },
];

const SkillForm: React.FC<ISkillFormProps> = props => {
  const { formData: propFormData, skills, onSubmit, onDismiss } = props;
  const initialFormData = Object.assign(defaultFormData, propFormData);
  const [formData, setFormData] = useState(initialFormData);
  const [formDataErrors, setFormDataErrors] = useState<{ name?: string }>({});
  const [addByUrl, setAddByUrl] = useState(true);

  const nameRegex = /^[a-zA-Z0-9-_.]+$/;

  const validateForm = (newData: ISkill) => {
    const errors: { name?: string } = {};
    const { name } = newData;

    if (name) {
      if (!nameRegex.test(name)) {
        errors.name = formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
      }
      if (skills.some(item => item.id === name)) {
        errors.name = formatMessage('Duplicate dialog name');
      }
    } else {
      errors.name = formatMessage('Please input a name');
    }
    setFormDataErrors(errors);
  };

  const updateForm = (field: string) => (e: FormEvent, newValue: string | undefined) => {
    const newData: ISkill = {
      ...formData,
      [field]: newValue,
    };
    validateForm(newData);
    setFormData(newData);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (Object.keys(formDataErrors).length > 0) {
      return;
    }

    onSubmit({
      ...formData,
    });
  };

  const onAddChoiceChange = (e, option) => {
    if (option.key === 'url') {
      setAddByUrl(true);
    } else {
      setAddByUrl(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="submit" style={{ display: 'none' }} />
      <Stack tokens={{ childrenGap: '3rem' }}>
        <StackItem grow={0}>
          <ChoiceGroup
            defaultSelectedKey="url"
            options={addOptions}
            onChange={onAddChoiceChange}
            label=""
            required={true}
          />
        </StackItem>
        <StackItem grow={0}>
          <TextField
            label={formatMessage('Name')}
            value={formData.name}
            //   styles={name}
            onChange={updateForm('name')}
            errorMessage={formDataErrors.name}
            data-testid="NewSkillName"
            required
            autoFocus
          />
          <TextField
            label={formatMessage('App Id')}
            value={formData.msAppId}
            //   styles={appId}
            onChange={updateForm('msAppId')}
            // errorMessage={formDataErrors.msAppId}
            data-testid="NewSkillAppId"
            required
          />
        </StackItem>
        <StackItem grow={0}>
          <TextField
            // styles={description}
            value={formData.endpointUrl}
            label={formatMessage('Skill endpoint')}
            resizable={false}
            required
            onChange={updateForm('endpointUrl')}
          />
        </StackItem>
      </Stack>

      <DialogFooter>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={handleSubmit} text={formatMessage('Next')} />
      </DialogFooter>
    </form>
  );
};

export default SkillForm;
