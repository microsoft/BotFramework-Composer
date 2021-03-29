// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useRef, useState } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useRecoilValue } from 'recoil';
import debounce from 'lodash/debounce';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Separator } from 'office-ui-fabric-react/lib/Separator';

import { settingsState, skillsStateSelector, luFilesState, designPageLocationState } from '../../recoilModel';
import { addSkillDialog } from '../../constants';
import httpClient from '../../utils/httpUtil';
import TelemetryClient from '../../telemetry/TelemetryClient';

import { SelectIntentModal } from './SelectIntentModal';
import { SkillDetail } from './SkillDetail';
import { TriggerFormData } from '../../utils/dialogUtil';

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
  onSubmit: (manifestUrl: string, endpointName: string, dialogId: string, triggerFormData: TriggerFormData) => void;
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

const getTriggerFormData = (intent: string, content: string): TriggerFormData => ({
  errors: {},
  $kind: 'Microsoft.OnIntent',
  event: '',
  intent: intent,
  triggerPhrases: content,
  regEx: '',
});

export const CreateSkillModal: React.FC<CreateSkillModalProps> = ({ projectId, onSubmit, onDismiss }) => {
  const skills = useRecoilValue(skillsStateSelector);
  const { publishTargets, languages, luFeatures } = useRecoilValue(settingsState(projectId));
  const { dialogId } = useRecoilValue(designPageLocationState(projectId));

  const [showIntentSelectDialog, setShowIntentSelectDialog] = useState(false);
  const [formData, setFormData] = useState<{ manifestUrl: string; endpointName: string }>({
    manifestUrl: '',
    endpointName: '',
  });
  const [formDataErrors, setFormDataErrors] = useState<SkillFormDataErrors>({});
  const [validationState, setValidationState] = useState({
    endpoint: ValidationState.NotValidated,
    manifestUrl: ValidationState.NotValidated,
    name: ValidationState.Validated,
  });
  const [skillManifest, setSkillManifest] = useState<any | null>(null);
  const luFiles = useRecoilValue(luFilesState(projectId));

  const debouncedValidateManifestURl = useRef(debounce(validateManifestUrl, 500)).current;

  const validationHelpers = {
    formDataErrors,
    skills,
    setFormDataErrors,
    setValidationState,
    setSkillManifest,
    validationState,
  };

  const handleManifestUrlChange = (_, currentManifestUrl = '') => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { manifestUrl, ...rest } = formData;
    setValidationState((validationState) => ({
      ...validationState,
      manifestUrl: ValidationState.NotValidated,
      endpoint: ValidationState.NotValidated,
    }));
    debouncedValidateManifestURl({
      formData: { manifestUrl: currentManifestUrl },
      projectId,
      ...validationHelpers,
    });
    setFormData({
      ...rest,
      manifestUrl: currentManifestUrl,
    });
    setSkillManifest(null);
    // setSelectedEndpointKey(null);
  };

  const handleSubmit = (event, content) => {
    event.preventDefault();
    // add a remote skill
    console.log(skillManifest.name);

    const triggerFormData = getTriggerFormData(skillManifest.name, content);
    onSubmit(formData.manifestUrl, formData.endpointName, dialogId, triggerFormData);
    TelemetryClient.track('AddNewSkillCompleted');
    // add trigger to root bot
    TelemetryClient.track('AddNewTriggerCompleted', { kind: 'Microsoft.OnIntent' });
  };

  const validateUrl = (event) => {
    event.preventDefault();
  };

  return (
    <Fragment>
      {showIntentSelectDialog ? (
        <SelectIntentModal
          languages={languages}
          luFeatures={luFeatures}
          manifest={skillManifest}
          projectId={projectId}
          onDismiss={onDismiss}
          onSubmit={handleSubmit}
          rootLuFiles={luFiles}
          dialogId={dialogId}
        />
      ) : (
        <DialogWrapper
          isOpen
          dialogType={DialogTypes.CreateFlow}
          title={addSkillDialog.SKILL_MANIFEST_FORM.title}
          onDismiss={onDismiss}
        >
          <Fragment>
            <div style={{ marginBottom: '16px' }}>
              {addSkillDialog.SKILL_MANIFEST_FORM.preSubText}
              <Link href="https://aka.ms/bf-composer-docs-publish-bot" target="_blank">
                {formatMessage(' Get an overview ')}
              </Link>
              or
              <Link href="https://aka.ms/bf-composer-docs-publish-bot" target="_blank">
                {formatMessage(' learn how to build a skill ')}
              </Link>
              {addSkillDialog.SKILL_MANIFEST_FORM.afterSubText}
            </div>
            <Separator />
            <Stack horizontal horizontalAlign="start" styles={{ root: { height: 300 } }}>
              <div style={{ width: '70%' }}>
                <TextField
                  required
                  disabled={!publishTargets || publishTargets.length < 1}
                  errorMessage={formDataErrors.manifestUrl}
                  label={formatMessage('Skill Manifest Url')}
                  value={formData.manifestUrl || ''}
                  onChange={handleManifestUrlChange}
                />
                {(!publishTargets || publishTargets.length < 1) && (
                  <div>
                    {formatMessage('To add a skill, your bot ToDoBotWithLuisSample must have publish profile')}
                    <Link href="https://aka.ms/bf-composer-docs-publish-bot" target="_blank">
                      {formatMessage(' Create a publish profile')}
                    </Link>
                  </div>
                )}
              </div>
              {skillManifest && (
                <Fragment>
                  <Separator vertical styles={{ root: { padding: '0px 20px' } }} />
                  <div style={{ minWidth: '50%' }}>
                    <SkillDetail manifest={skillManifest} />
                  </div>
                </Fragment>
              )}
            </Stack>
            <Stack>
              <StackItem>
                <Separator />
              </StackItem>
              <StackItem align={'end'}>
                <DefaultButton data-testid="SkillFormCancel" text={formatMessage('Cancel')} onClick={onDismiss} />
                {skillManifest ? (
                  <PrimaryButton
                    styles={{ root: { marginLeft: '8px' } }}
                    text={formatMessage('Next')}
                    onClick={(event) => {
                      if (luFiles.length) {
                        setShowIntentSelectDialog(true);
                      } else {
                        handleSubmit(event);
                      }
                    }}
                  />
                ) : (
                  <PrimaryButton
                    disabled={!formData.manifestUrl}
                    styles={{ root: { marginLeft: '8px' } }}
                    text={formatMessage('Valify Url')}
                    onClick={validateUrl}
                  />
                )}
              </StackItem>
            </Stack>
          </Fragment>
        </DialogWrapper>
      )}
    </Fragment>
  );
};

export default CreateSkillModal;
