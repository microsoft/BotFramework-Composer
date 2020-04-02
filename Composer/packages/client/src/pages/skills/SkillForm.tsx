// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, FormEvent, useCallback, Fragment, useEffect } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { assignDefined } from '@bfc/shared';

import {
  ISkill,
  ISkillFormData,
  ISkillFormDataErrors,
  ISkillByAppConfig,
  ISkillByManifestUrl,
  ISkillType,
  SkillAppIdRegex,
  SkillNameRegex,
  SkillUrlRegex,
} from './types';
import {
  ChoiceGroupAlignHorizontal,
  FormFieldAlignHorizontal,
  FormFieldAppId,
  FormFieldName,
  FormFieldEndpoint,
  FormFieldManifestUrl,
  MarginLeftSmall,
} from './styles';

export interface ISkillFormProps {
  editIndex?: number;
  skills: ISkill[];
  onSubmit: (skillFormData: ISkillByAppConfig | ISkillByManifestUrl, editIndex: number) => void;
  onDismiss: () => void;
}

const defaultFormData = {
  manifestUrl: '',
  name: '',
  endpointUrl: '',
  msAppId: '',
};

const addOptions: IChoiceGroupOption[] = [
  { key: ISkillType.URL, text: 'Add by manifest url' },
  { key: ISkillType.APPConfig, text: 'Add by App configurations' },
];

const SkillForm: React.FC<ISkillFormProps> = props => {
  const { editIndex = -1, skills, onSubmit, onDismiss } = props;
  const isModify = editIndex >= 0 && editIndex < skills.length;
  const originFormData = skills[editIndex];
  const initialFormData = isModify ? assignDefined(defaultFormData, originFormData) : { ...defaultFormData };
  const [formData, setFormData] = useState<ISkillFormData>(initialFormData);
  const [formDataErrors, setFormDataErrors] = useState<ISkillFormDataErrors>({});

  const defaultOptionSelectedKey = !isModify || originFormData?.manifestUrl ? ISkillType.URL : ISkillType.APPConfig;

  const [optionSelectedKey, setOptionSelectedKey] = React.useState<string>(defaultOptionSelectedKey);

  useEffect(() => {
    setOptionSelectedKey(defaultOptionSelectedKey);
    setFormData(initialFormData);
  }, [editIndex]);

  const validateForm = (newData: ISkillFormData): ISkillFormDataErrors => {
    const errors: ISkillFormDataErrors = {};
    const { manifestUrl, name, msAppId, endpointUrl } = newData;

    if (optionSelectedKey === ISkillType.URL) {
      if (manifestUrl) {
        if (!SkillUrlRegex.test(manifestUrl)) {
          errors.manifestUrl = formatMessage('Url should start with http[s]://');
        }
      } else {
        errors.manifestUrl = formatMessage('Please input a valid skill manifest url');
      }
    } else if (optionSelectedKey === ISkillType.APPConfig) {
      if (name) {
        if (!SkillNameRegex.test(name)) {
          errors.name = formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
        }
        if (!isModify && skills.some(item => item.id === name)) {
          errors.name = formatMessage('Duplicate dialog name');
        }
      } else {
        errors.name = formatMessage('Please input a name');
      }

      if (msAppId) {
        if (!SkillAppIdRegex.test(msAppId)) {
          errors.msAppId = formatMessage('Not a valid App Id');
        }
        if (!isModify && skills.some(item => item.msAppId === msAppId)) {
          errors.msAppId = formatMessage('Duplicate App Id');
        }
      } else {
        errors.msAppId = formatMessage('Please input a App Id');
      }

      if (endpointUrl) {
        if (!SkillUrlRegex.test(endpointUrl)) {
          errors.endpointUrl = formatMessage('Url should start with http[s]://');
        }
      } else {
        errors.endpointUrl = formatMessage('Please input a endpoint url');
      }
    }
    return errors;
  };

  const updateForm = (field: string) => (e: FormEvent, newValue: string | undefined) => {
    const newData: ISkillFormData = {
      ...formData,
      [field]: newValue,
    };
    setFormDataErrors(validateForm(newData));
    setFormData(newData);
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errors = validateForm(formData);
    setFormDataErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }
    const newFormData = { ...formData } as ISkillByAppConfig | ISkillByManifestUrl;

    onSubmit(newFormData, editIndex);
  };

  const onAddOptionsChange = useCallback((_e, option) => {
    setOptionSelectedKey(option.key);
    setFormData(initialFormData);
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <input type="submit" style={{ display: 'none' }} />
      <Stack tokens={{ childrenGap: '3rem' }}>
        <StackItem grow={0}>
          <ChoiceGroup
            disabled={isModify}
            css={ChoiceGroupAlignHorizontal}
            data-testid={'add-by-choice'}
            selectedKey={optionSelectedKey}
            options={addOptions}
            onChange={onAddOptionsChange}
            label=""
            required={true}
          />
        </StackItem>
        {optionSelectedKey === ISkillType.URL && (
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
        )}

        {optionSelectedKey === ISkillType.APPConfig && (
          <Fragment>
            <StackItem grow={0} css={FormFieldAlignHorizontal}>
              <TextField
                css={FormFieldName}
                label={formatMessage('Name')}
                value={formData.name}
                onChange={updateForm('name')}
                errorMessage={formDataErrors.name}
                data-testid="NewSkillName"
                required
                autoFocus
              />
              <TextField
                css={FormFieldAppId}
                label={formatMessage('App Id')}
                value={formData.msAppId}
                onChange={updateForm('msAppId')}
                errorMessage={formDataErrors.msAppId}
                data-testid="NewSkillAppId"
                required
              />
            </StackItem>
            <StackItem grow={0}>
              <TextField
                css={FormFieldEndpoint}
                value={formData.endpointUrl}
                label={formatMessage('Skill endpoint')}
                onChange={updateForm('endpointUrl')}
                errorMessage={formDataErrors.endpointUrl}
                resizable={true}
                required
              />
            </StackItem>
          </Fragment>
        )}

        <StackItem>
          <PrimaryButton onClick={handleSubmit} text={formatMessage('Confirm')} />
          <DefaultButton css={MarginLeftSmall} onClick={onDismiss} text={formatMessage('Cancel')} />
        </StackItem>
      </Stack>
    </form>
  );
};

export default SkillForm;
