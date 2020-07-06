// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, FormEvent, useEffect, useCallback, useRef } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { assignDefined, Skill } from '@bfc/shared';
import debounce from 'lodash/debounce';

import { DialogWrapper } from '../../DialogWrapper/DialogWrapper';
import { DialogTypes } from '../../DialogWrapper/styles';
import { addSkillDialog } from '../../../constants';
import { ISkillFormData, ISkillFormDataErrors, skillUrlRegex, skillNameRegex } from '../types';

import { FormFieldManifestUrl, FormFieldEditName, MarginLeftSmall, FormModalBody, SpinnerLabel } from './styles';
import { validateManifestUrl } from './validateManifestUrl';

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

const CreateSkillModal: React.FC<ICreateSkillModalProps> = (props) => {
  const { editIndex = -1, skills, onSubmit, onDismiss, isOpen, projectId } = props;
  const originFormData = skills[editIndex];
  const initialFormData = originFormData
    ? assignDefined(defaultFormData, { manifestUrl: originFormData.manifestUrl, name: originFormData.name })
    : { ...defaultFormData };
  const [formData, setFormData] = useState<ISkillFormData>(initialFormData);
  const [formDataErrors, setFormDataErrors] = useState<ISkillFormDataErrors>({});
  const [isValidating, setIsValidating] = useState(false);

  const isModify = editIndex >= 0 && editIndex < skills.length;
  useEffect(() => {
    setFormData(initialFormData);
  }, [editIndex]);

  const asyncManifestUrlValidation = async (projectId: string, manifestUrl: string) => {
    const err = await validateManifestUrl(projectId, manifestUrl);
    if (err) {
      setFormDataErrors((current) => ({ ...current, manifestUrl: err }));
    }
    setIsValidating(false);
  };

  const debouncedManifestValidation = useRef(debounce(asyncManifestUrlValidation, 300)).current;

  const validateForm = (newData: ISkillFormData): ISkillFormDataErrors => {
    const errors: ISkillFormDataErrors = { ...formDataErrors };

    if (newData.manifestUrl != null) {
      const { manifestUrl } = newData;

      let currentError = '';
      if (manifestUrl) {
        if (!skillUrlRegex.test(manifestUrl)) {
          currentError = formatMessage('Url should start with http[s]://');
        }

        const duplicatedItemIndex = skills.findIndex((item) => item.manifestUrl === manifestUrl);
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

    if (newData.name != null) {
      const { name } = newData;
      let currentError = '';
      if (name) {
        if (!skillNameRegex.test(name)) {
          currentError = formatMessage('Name contains invalid charactors');
        }

        const duplicatedItemIndex = skills.findIndex((item) => item.name === name);
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
    if (!formDataErrors.manifestUrl) {
      setIsValidating(true);
      debouncedManifestValidation(projectId, formData.manifestUrl);
    }

    () => {
      debouncedManifestValidation.cancel();
    };
  }, [formData.manifestUrl, formDataErrors.manifestUrl]);

  const updateForm = (field: string) => (e: FormEvent, newValue: string | undefined) => {
    const newData: ISkillFormData = {
      ...formData,
      [field]: newValue,
    };
    setFormData(newData);
    const errors = validateForm(newData);
    setFormDataErrors(errors);
  };

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (isValidating) return;
      setIsValidating(true);

      const errors = validateForm(formData);
      setFormDataErrors(errors);
      if (Object.keys(errors).length > 0) {
        setIsValidating(false);
        return;
      }

      // do async validation
      validateManifestUrl(projectId, formData.manifestUrl).then((error) => {
        if (error) {
          setFormDataErrors((current) => ({ ...current, manifestUrl: error }));
          setIsValidating(false);
          return;
        }
        const newFormData = { ...formData };
        onSubmit(newFormData, editIndex);
        setIsValidating(false);
      });
    },
    [formData, formDataErrors]
  );

  const formTitles =
    editIndex === -1 ? { ...addSkillDialog.SKILL_MANIFEST_FORM } : { ...addSkillDialog.SKILL_MANIFEST_FORM_EDIT };

  const isDisabled = !Object.values(formData).some(Boolean) || Object.values(formDataErrors).some(Boolean);

  return (
    <DialogWrapper isOpen={isOpen} onDismiss={onDismiss} {...formTitles} dialogType={DialogTypes.CreateFlow}>
      <form css={FormModalBody} onSubmit={handleSubmit}>
        <input style={{ display: 'none' }} type="submit" />
        <Stack tokens={{ childrenGap: '3rem' }}>
          <StackItem grow={0}>
            <TextField
              autoFocus
              required
              css={FormFieldManifestUrl}
              data-testid="NewSkillManifestUrl"
              errorMessage={formDataErrors.manifestUrl}
              label={formatMessage('Manifest url')}
              value={formData.manifestUrl}
              onChange={updateForm('manifestUrl')}
            />
            {isValidating && (
              <Spinner
                css={SpinnerLabel}
                label={formatMessage('Validating...')}
                labelPosition="right"
                size={SpinnerSize.medium}
              />
            )}
            <TextField
              css={FormFieldEditName}
              data-testid="NewSkillName"
              errorMessage={formDataErrors.name}
              label={formatMessage('Custom name (optional)')}
              value={formData.name}
              onChange={updateForm('name')}
            />
          </StackItem>

          <StackItem>
            <PrimaryButton
              disabled={isDisabled || isValidating}
              text={formatMessage('Confirm')}
              onClick={handleSubmit}
            />
            <DefaultButton
              css={MarginLeftSmall}
              data-testid="SkillFormCancel"
              text={formatMessage('Cancel')}
              onClick={onDismiss}
            />
          </StackItem>
        </Stack>
      </form>
    </DialogWrapper>
  );
};

export default CreateSkillModal;
