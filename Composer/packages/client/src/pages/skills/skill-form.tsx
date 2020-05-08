// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import has from 'lodash/has';
import { jsx } from '@emotion/core';
import React, { useState, FormEvent, useEffect } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { assignDefined, Skill } from '@bfc/shared';
import { Modal } from 'office-ui-fabric-react/lib/Modal';

import { ISkillFormData, ISkillFormDataErrors, SkillUrlRegex, SkillNameRegex } from './types';
import { FormFieldManifestUrl, FormFieldEditName, MarginLeftSmall, FormModalTitle, FormModalBody } from './styles';
export interface ISkillFormProps {
  isOpen: boolean;
  editIndex?: number;
  skills: Skill[];
  projectId: string;
  checkSkill: (config) => void;
  onSubmit: (skillFormData: ISkillFormData, editIndex: number) => void;
  onDismiss: () => void;
}

const defaultFormData = {
  manifestUrl: '',
};

const SkillForm: React.FC<ISkillFormProps> = props => {
  const { editIndex = -1, skills, onSubmit, onDismiss, isOpen, projectId, checkSkill } = props;
  const originFormData = skills[editIndex];
  const initialFormData = originFormData
    ? assignDefined(defaultFormData, { manifestUrl: originFormData.manifestUrl, name: originFormData.name })
    : { ...defaultFormData };
  const [formData, setFormData] = useState<ISkillFormData>(initialFormData);
  const [formDataErrors, setFormDataErrors] = useState<ISkillFormDataErrors>({});

  const isModify = editIndex >= 0 && editIndex < skills.length;
  useEffect(() => {
    setFormData(initialFormData);
  }, [editIndex]);

  const validateForm = async (newData: any): Promise<ISkillFormDataErrors> => {
    const errors: ISkillFormDataErrors = {};

    if (has(newData, 'manifestUrl')) {
      const { manifestUrl } = newData;

      if (manifestUrl) {
        let manifestUrlErrorMsg = '';
        if (!SkillUrlRegex.test(manifestUrl)) {
          manifestUrlErrorMsg = formatMessage('Url should start with http[s]://');
        }

        if (!manifestUrlErrorMsg) {
          const duplicatedItemIndex = skills.findIndex(item => item.manifestUrl === manifestUrl);
          if (duplicatedItemIndex !== -1 && (!isModify || (isModify && duplicatedItemIndex !== editIndex))) {
            manifestUrlErrorMsg = formatMessage('Duplicate skill manifest Url');
          }
        }

        if (!manifestUrlErrorMsg) {
          try {
            await checkSkill({ projectId, url: manifestUrl });
          } catch (err) {
            manifestUrlErrorMsg = err.response && err.response.data.message ? err.response.data.message : err;
          }
        }
        if (manifestUrlErrorMsg) {
          errors.manifestUrl = manifestUrlErrorMsg;
        }
      } else {
        errors.manifestUrl = formatMessage('Please input a manifest url');
      }
    }

    if (has(newData, 'name')) {
      const { name } = newData;
      if (name) {
        if (!SkillNameRegex.test(name)) {
          errors.name = formatMessage('Name contains invalid charactors');
        }
      }
    }

    return errors;
  };

  const updateForm = (field: string) => async (e: FormEvent, newValue: string | undefined) => {
    const newData: ISkillFormData = {
      ...formData,
      [field]: newValue,
    };
    setFormData(newData);

    // only update current field error
    const data = {};
    data[field] = newValue;
    const errors = { ...formDataErrors };
    const currentErrors = await validateForm(data);
    errors[field] = currentErrors[field];
    setFormDataErrors(errors);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errors = await validateForm(formData);
    setFormDataErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }
    const newFormData = { ...formData };

    onSubmit(newFormData, editIndex);
  };

  return (
    <Modal titleAriaId="skillConnectionModal" isOpen={isOpen} onDismiss={onDismiss} isBlocking={false}>
      <h2 css={FormModalTitle}>
        {editIndex === -1 ? formatMessage('Connect to a new skill') : formatMessage('Edit skill connection')}
      </h2>
      <form onSubmit={handleSubmit} css={FormModalBody}>
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
            <TextField
              css={FormFieldEditName}
              label={formatMessage('Custom name (optional)')}
              value={formData.name}
              onChange={updateForm('name')}
              errorMessage={formDataErrors.name}
              data-testid="NewSkillName"
            />
          </StackItem>

          <StackItem>
            <PrimaryButton onClick={handleSubmit} text={formatMessage('Confirm')} />
            <DefaultButton
              css={MarginLeftSmall}
              onClick={onDismiss}
              text={formatMessage('Cancel')}
              data-testid="SkillFormCancel"
            />
          </StackItem>
        </Stack>
      </form>
    </Modal>
  );
};

export default SkillForm;
