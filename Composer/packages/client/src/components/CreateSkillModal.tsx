// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useRef, useState, useMemo } from 'react';
import formatMessage from 'format-message';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useRecoilValue } from 'recoil';
import debounce from 'lodash/debounce';
import { SkillSetting } from '@bfc/shared';

import { addSkillDialog } from '../constants';
import httpClient from '../utils/httpUtil';
import { skillsState } from '../recoilModel';

import { DialogWrapper, DialogTypes } from './DialogWrapper';

export interface SkillFormDataErrors {
  endpoint?: string;
  manifestUrl?: string;
  name?: string;
}

export const urlRegex = /^http[s]?:\/\/\w+/;
export const skillNameRegex = /^\w[-\w]*$/;
export const msAppIdRegex = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;

export interface CreateSkillModalProps {
  projectId: string;
  onSubmit: (data: SkillSetting) => void;
  onDismiss: () => void;
}

enum ValidationState {
  NotValidated = 'NotValidated',
  Validating = 'Validating',
  Validated = 'Validated',
}

export const validateEndpoint = ({
  formData,
  formDataErrors,
  setFormDataErrors,
  setValidationState,
  validationState,
}) => {
  const { msAppId, endpointUrl } = formData;
  const { endpoint: _, ...errors } = formDataErrors;

  if (!msAppId || !endpointUrl) {
    setFormDataErrors({ ...errors, endpoint: formatMessage('Please select a valid endpoint') });
  } else if (!urlRegex.test(endpointUrl) || !msAppIdRegex.test(msAppId)) {
    setFormDataErrors({ ...errors, endpoint: formatMessage('Skill manifest endpoint is configured improperly') });
  } else {
    setFormDataErrors(errors);
    setValidationState({ ...validationState, endpoint: ValidationState.Validated });
  }
};

export const validateManifestUrl = async ({
  formData,
  formDataErrors,
  projectId,
  skills,
  setFormDataErrors,
  setValidationState,
  setSkillManifest,
  validationState,
}) => {
  const { manifestUrl } = formData;
  const { manifestUrl: _, ...errors } = formDataErrors;

  if (!manifestUrl) {
    setFormDataErrors({ ...errors, manifestUrl: formatMessage('Please input a manifest Url') });
  } else if (!urlRegex.test(manifestUrl)) {
    setFormDataErrors({ ...errors, manifestUrl: formatMessage('Url should start with http[s]://') });
  } else if (skills.some((skill) => skill.manifestUrl.toLowerCase() === manifestUrl.toLowerCase())) {
    setFormDataErrors({ ...errors, manifestUrl: formatMessage('Duplicate skill manifest Url') });
  } else {
    try {
      setValidationState({ ...validationState, manifestUrl: ValidationState.Validating });
      const { data } = await httpClient.get(`/projects/${projectId}/skill/retrieveSkillManifest`, {
        params: {
          url: manifestUrl,
        },
      });
      setFormDataErrors(errors);
      setSkillManifest(data);
      setValidationState({ ...validationState, manifestUrl: ValidationState.Validated });
    } catch (error) {
      setFormDataErrors({ ...errors, manifestUrl: formatMessage('Manifest url can not be accessed') });
      setValidationState({ ...validationState, manifestUrl: ValidationState.NotValidated });
    }
  }
};

export const validateName = ({
  formData,
  formDataErrors,
  skills,
  setFormDataErrors,
  setValidationState,
  validationState,
}) => {
  const { name } = formData;
  const { name: _, ...errors } = formDataErrors;

  if (name && !skillNameRegex.test(name)) {
    setFormDataErrors({ ...errors, name: formatMessage('Name cannot include special characters or spaces') });
  } else if (name && skills.some((skill) => skill.name.toLowerCase() === name.toLowerCase())) {
    setFormDataErrors({ ...errors, name: formatMessage('Duplicate skill name') });
  } else {
    setFormDataErrors(errors);
    setValidationState({ ...validationState, name: ValidationState.Validated });
  }
};

export const CreateSkillModal: React.FC<CreateSkillModalProps> = ({ projectId, onSubmit, onDismiss }) => {
  const skills = useRecoilValue(skillsState(projectId));

  const [formData, setFormData] = useState<Partial<SkillSetting>>({});
  const [formDataErrors, setFormDataErrors] = useState<SkillFormDataErrors>({});
  const [validationState, setValidationState] = useState({
    endpoint: ValidationState.NotValidated,
    manifestUrl: ValidationState.NotValidated,
    name: ValidationState.Validated,
  });
  const [selectedEndpointKey, setSelectedEndpointKey] = useState<number | null>(null);
  const [skillManifest, setSkillManifest] = useState<any | null>(null);

  const endpointOptions = useMemo<IDropdownOption[]>(() => {
    return (skillManifest?.endpoints || [])?.map(({ name, endpointUrl, msAppId }, key) => ({
      key,
      text: name,
      data: {
        endpointUrl,
        msAppId,
      },
    }));
  }, [skillManifest]);

  const debouncedValidateName = useRef(debounce(validateName, 500)).current;
  const debouncedValidateManifestURl = useRef(debounce(validateManifestUrl, 500)).current;

  const validationHelpers = {
    formDataErrors,
    skills,
    setFormDataErrors,
    setValidationState,
    setSkillManifest,
    validationState,
  };

  const handleManifestUrlChange = (_, manifestUrl = '') => {
    const { msAppId, endpointUrl, ...rest } = formData;
    setValidationState((validationState) => ({
      ...validationState,
      manifestUrl: ValidationState.NotValidated,
      endpoint: ValidationState.NotValidated,
    }));
    debouncedValidateManifestURl({
      formData: { ...rest, manifestUrl },
      projectId,
      ...validationHelpers,
    });
    setFormData({
      ...rest,
      manifestUrl,
    });
    setSkillManifest(null);
    setSelectedEndpointKey(null);
  };

  const handleNameChange = (_, name = '') => {
    setValidationState((validationState) => ({ ...validationState, name: ValidationState.NotValidated }));
    debouncedValidateName({
      formData: { ...formData, name },
      ...validationHelpers,
    });
    setFormData({
      ...formData,
      name,
    });
  };

  const handleEndpointUrlChange = (_, option?: IDropdownOption) => {
    if (option) {
      const { data, key } = option;
      validateEndpoint({
        formData: {
          ...data,
          ...formData,
        },
        ...validationHelpers,
      });
      setFormData({
        ...data,
        ...formData,
      });
      setSelectedEndpointKey(key as number);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      Object.values(validationState).every((validation) => validation === ValidationState.Validated) &&
      !Object.values(formDataErrors).some(Boolean)
    ) {
      onSubmit({ name: skillManifest.name, ...formData } as SkillSetting);
    }
  };

  const isDisabled =
    !formData.manifestUrl ||
    Object.values(formDataErrors).some(Boolean) ||
    !Object.values(validationState).every((validation) => validation === ValidationState.Validated);

  return (
    <DialogWrapper
      isOpen
      onDismiss={onDismiss}
      {...addSkillDialog.SKILL_MANIFEST_FORM}
      dialogType={DialogTypes.CreateFlow}
    >
      <form onSubmit={handleSubmit}>
        <input style={{ display: 'none' }} type="submit" />
        <Stack tokens={{ childrenGap: '3rem' }}>
          <StackItem grow={0}>
            <TextField
              required
              errorMessage={formDataErrors.manifestUrl}
              label={formatMessage('Manifest url')}
              value={formData.manifestUrl || ''}
              onChange={handleManifestUrlChange}
            />
            {validationState.manifestUrl === ValidationState.Validating && (
              <Spinner
                label={formatMessage('Validating...')}
                labelPosition="right"
                size={SpinnerSize.medium}
                styles={{
                  root: {
                    justifyContent: 'flex-start',
                    marginTop: '2px',
                  },
                }}
              />
            )}
            <TextField
              errorMessage={formDataErrors.name}
              label={formatMessage('Custom name (optional)')}
              value={formData.name || ''}
              onChange={handleNameChange}
            />
            <Label required>{formatMessage('Skill Endpoint')}</Label>
            <Dropdown
              disabled={!endpointOptions.length}
              errorMessage={formDataErrors.endpoint}
              options={endpointOptions}
              selectedKey={selectedEndpointKey}
              onChange={handleEndpointUrlChange}
            />
          </StackItem>

          <StackItem align={'end'}>
            <DefaultButton data-testid="SkillFormCancel" text={formatMessage('Cancel')} onClick={onDismiss} />
            <PrimaryButton
              disabled={isDisabled}
              styles={{ root: { marginLeft: '8px' } }}
              text={formatMessage('Confirm')}
              onClick={handleSubmit}
            />
          </StackItem>
        </Stack>
      </form>
    </DialogWrapper>
  );
};

export default CreateSkillModal;
