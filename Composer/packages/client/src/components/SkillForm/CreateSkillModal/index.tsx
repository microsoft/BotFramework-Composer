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

import httpClient from '../../../utils/httpUtil';
import { DialogWrapper } from '../../DialogWrapper';
import { DialogTypes } from '../../DialogWrapper/styles';
import { addSkillDialog } from '../../../constants';
import { ISkillFormData, ISkillFormDataErrors, SkillUrlRegex, SkillNameRegex } from '../types';

import { FormFieldManifestUrl, FormFieldEditName, MarginLeftSmall, FormModalBody } from './styles';

export interface ICreateSkillModalProps {
  isOpen: boolean;
  editIndex?: number;
  skills: Skill[];
  projectId: string;
  onSubmit: (skillFormData: ISkillFormData, editIndex: number) => void;
  onDismiss: () => void;
}

const defaultFormData = {
  manifestUrl: '',
};

const CreateSkillModal: React.FC<ICreateSkillModalProps> = props => {
  const { editIndex = -1, skills, onSubmit, onDismiss, isOpen, projectId } = props;
  const originFormData = skills[editIndex];
  const initialFormData = originFormData
    ? assignDefined(defaultFormData, { manifestUrl: originFormData.manifestUrl, name: originFormData.name })
    : { ...defaultFormData };
  const [formData, setFormData] = useState<ISkillFormData>(initialFormData);
  const [formDataErrors, setFormDataErrors] = useState<ISkillFormDataErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isModify = editIndex >= 0 && editIndex < skills.length;
  useEffect(() => {
    setFormData(initialFormData);
  }, [editIndex]);

  const asyncValidateForm = async (newData: any): Promise<ISkillFormDataErrors> => {
    const errors: ISkillFormDataErrors = { ...formDataErrors };

    const url = newData.manifestUrl;

    // skip validation if has local other errors.
    if (!url || errors.manifestUrl) return errors;

    try {
      await httpClient.post(`/projects/${projectId}/skill/check`, { projectId, url });
      if (errors.manifestUrlFetch) {
        delete errors.manifestUrlFetch;
      }
    } catch (err) {
      errors.manifestUrlFetch = err.response && err.response.data.message ? err.response.data.message : err;
    }
    return errors;
  };

  const validateForm = (newData: ISkillFormData): ISkillFormDataErrors => {
    const errors: ISkillFormDataErrors = { ...formDataErrors };

    if (has(newData, 'manifestUrl')) {
      const { manifestUrl } = newData;

      let currentError = '';
      if (manifestUrl) {
        if (!SkillUrlRegex.test(manifestUrl)) {
          currentError = formatMessage('Url should start with http[s]://');
        }

        const duplicatedItemIndex = skills.findIndex(item => item.manifestUrl === manifestUrl);
        if (duplicatedItemIndex !== -1 && (!isModify || (isModify && duplicatedItemIndex !== editIndex))) {
          currentError = formatMessage('Duplicate skill manifest Url');
        }
      } else {
        currentError = formatMessage('Please input a manifest url');
      }

      if (currentError) {
        errors.manifestUrl = currentError;
      } else {
        delete errors.manifestUrl;
      }
    }

    if (has(newData, 'name')) {
      const { name } = newData;
      let currentError = '';
      if (name) {
        if (!SkillNameRegex.test(name)) {
          currentError = formatMessage('Name contains invalid charactors');
        }

        const duplicatedItemIndex = skills.findIndex(item => item.name === name);
        if (duplicatedItemIndex !== -1 && (!isModify || (isModify && duplicatedItemIndex !== editIndex))) {
          currentError = formatMessage('Duplicate skill name');
        }
      }

      if (currentError) {
        errors.name = currentError;
      } else {
        delete errors.name;
      }
    }

    return errors;
  };

  // fetch manifest url
  useEffect(() => {
    asyncValidateForm(formData).then(errors => {
      setFormDataErrors(errors);
    });
  }, [formData.manifestUrl]);

  const updateForm = (field: string) => (e: FormEvent, newValue: string | undefined) => {
    const newData: ISkillFormData = {
      ...formData,
      [field]: newValue,
    };
    setFormData(newData);
    const errors = validateForm(newData);
    setFormDataErrors(errors);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (Object.keys(formDataErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    const errors = validateForm(formData);
    setFormDataErrors(errors);
    if (Object.keys(errors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    // do async validation
    asyncValidateForm(formData).then(errors => {
      setFormDataErrors(errors);
      if (Object.keys(errors).length > 0) {
        setIsSubmitting(false);
        return;
      }
      const newFormData = { ...formData };
      onSubmit(newFormData, editIndex);
      setIsSubmitting(false);
    });
  };

  const formTitles =
    editIndex === -1 ? { ...addSkillDialog.SKILL_MANIFEST_FORM } : { ...addSkillDialog.SKILL_MANIFEST_FORM_EDIT };

  return (
    <DialogWrapper isOpen={isOpen} onDismiss={onDismiss} {...formTitles} dialogType={DialogTypes.CreateFlow}>
      <form onSubmit={handleSubmit} css={FormModalBody}>
        <input type="submit" style={{ display: 'none' }} />
        <Stack tokens={{ childrenGap: '3rem' }}>
          <StackItem grow={0}>
            <TextField
              css={FormFieldManifestUrl}
              label={formatMessage('Manifest url')}
              value={formData.manifestUrl}
              onChange={updateForm('manifestUrl')}
              errorMessage={formDataErrors.manifestUrl || formDataErrors.manifestUrlFetch}
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
            <PrimaryButton onClick={handleSubmit} text={formatMessage('Confirm')} disabled={isSubmitting} />
            <DefaultButton
              css={MarginLeftSmall}
              onClick={onDismiss}
              text={formatMessage('Cancel')}
              data-testid="SkillFormCancel"
            />
          </StackItem>
        </Stack>
      </form>
    </DialogWrapper>
  );
};

export default CreateSkillModal;
