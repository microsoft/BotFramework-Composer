// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, FormEvent, useEffect } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { assignDefined, Skill } from '@bfc/shared';

import { ISkillFormData, ISkillFormDataErrors, SkillUrlRegex } from './types';
import { FormFieldManifestUrl, MarginLeftSmall } from './styles';

export interface ISkillFormProps {
  editIndex?: number;
  skills: Skill[];
  onSubmit: (skillFormData: ISkillFormData, editIndex: number) => void;
  onDismiss: () => void;
}

const defaultFormData = {
  manifestUrl: '',
};

const SkillForm: React.FC<ISkillFormProps> = props => {
  const { editIndex = -1, skills, onSubmit, onDismiss } = props;
  const originFormData = skills[editIndex];
  const initialFormData = originFormData ? assignDefined(defaultFormData, originFormData) : { ...defaultFormData };
  const [formData, setFormData] = useState<ISkillFormData>(initialFormData);
  const [formDataErrors, setFormDataErrors] = useState<ISkillFormDataErrors>({});

  const isModify = editIndex >= 0 && editIndex < skills.length;
  useEffect(() => {
    setFormData(initialFormData);
  }, [editIndex]);

  const validateForm = (newData: ISkillFormData): ISkillFormDataErrors => {
    const errors: ISkillFormDataErrors = {};
    const { manifestUrl } = newData;

    if (manifestUrl) {
      if (!SkillUrlRegex.test(manifestUrl)) {
        errors.manifestUrl = formatMessage('Url should start with http[s]://');
      }

      if (!isModify && skills.some(item => item.manifestUrl === manifestUrl)) {
        errors.manifestUrl = formatMessage('Duplicate manifestUrl');
      }
    } else {
      errors.manifestUrl = formatMessage('Please input a valid skill manifest url');
    }

    return errors;
  };

  const updateForm = (field: string) => (e: FormEvent, newValue: string | undefined) => {
    const newData: ISkillFormData = {
      ...formData,
      [field]: newValue,
    };

    // only update current field error
    const errors = { ...formDataErrors };
    const currentErrors = validateForm(newData);
    errors[field] = currentErrors[field];
    setFormDataErrors(errors);
    setFormData(newData);
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errors = validateForm(formData);
    setFormDataErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }
    const newFormData = { ...formData };

    onSubmit(newFormData, editIndex);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="submit" style={{ display: 'none' }} />
      <Stack tokens={{ childrenGap: '3rem' }}>
        <StackItem grow={0}>
          <TextField
            css={FormFieldManifestUrl}
            label={formatMessage('Manifest url')}
            value={formData.manifestUrl}
            onChange={updateForm('manifestUrl')}
            errorMessage={formDataErrors.manifestUrl}
            data-testid="NewSkillManifestUrl"
            required
            autoFocus
          />
        </StackItem>

        <StackItem>
          <PrimaryButton onClick={handleSubmit} text={formatMessage('Confirm')} />
          <DefaultButton css={MarginLeftSmall} onClick={onDismiss} text={formatMessage('Cancel')} />
        </StackItem>
      </Stack>
    </form>
  );
};

export default SkillForm;
