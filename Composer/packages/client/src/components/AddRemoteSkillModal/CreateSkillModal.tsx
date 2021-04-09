// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
// import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { useRecoilValue } from 'recoil';
import debounce from 'lodash/debounce';
import { isUsingAdaptiveRuntime, SDKKinds } from '@bfc/shared';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { settingsState, designPageLocationState, dispatcherState, luFilesSelectorFamily } from '../../recoilModel';
import { addSkillDialog } from '../../constants';
import httpClient from '../../utils/httpUtil';
import TelemetryClient from '../../telemetry/TelemetryClient';
import { TriggerFormData } from '../../utils/dialogUtil';
import { selectIntentDialog } from '../../constants';

import { SelectIntent } from './SelectIntent';
import { SkillDetail } from './SkillDetail';

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
  addRemoteSkill: (manifestUrl: string, endpointName: string) => Promise<void>;
  addTriggerToRoot: (dialogId: string, triggerFormData: TriggerFormData, skillId: string) => void;
  onDismiss: () => void;
}

export const validateManifestUrl = async ({ formData, formDataErrors, setFormDataErrors }) => {
  const { manifestUrl } = formData;
  const { manifestUrl: _, ...errors } = formDataErrors;

  if (!manifestUrl) {
    setFormDataErrors({ ...errors, manifestUrl: formatMessage('Please input a manifest Url') });
  } else if (!urlRegex.test(manifestUrl)) {
    setFormDataErrors({ ...errors, manifestUrl: formatMessage('Url should start with http[s]://') });
  } else {
    setFormDataErrors({});
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

export const CreateSkillModal: React.FC<CreateSkillModalProps> = (props) => {
  const { projectId, addRemoteSkill, addTriggerToRoot, onDismiss } = props;

  const [title, setTitle] = useState({
    subText: '',
    title: addSkillDialog.SKILL_MANIFEST_FORM.title,
  });
  const [showIntentSelectDialog, setShowIntentSelectDialog] = useState(false);
  const [formData, setFormData] = useState<{ manifestUrl: string; endpointName: string }>({
    manifestUrl: '',
    endpointName: '',
  });
  const [formDataErrors, setFormDataErrors] = useState<SkillFormDataErrors>({});
  const [skillManifest, setSkillManifest] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const { languages, luFeatures, runtime } = useRecoilValue(settingsState(projectId));
  const { dialogId } = useRecoilValue(designPageLocationState(projectId));
  const luFiles = useRecoilValue(luFilesSelectorFamily(projectId));
  const { updateRecognizer } = useRecoilValue(dispatcherState);

  const debouncedValidateManifestURl = useRef(debounce(validateManifestUrl, 500)).current;

  const validationHelpers = {
    formDataErrors,
    setFormDataErrors,
  };

  const options: IDropdownOption[] = useMemo(() => {
    return skillManifest?.endpoints?.map((item) => {
      return {
        key: item.msAppId,
        text: formatMessage(item.name),
      };
    });
  }, [skillManifest]);

  const handleManifestUrlChange = (_, currentManifestUrl = '') => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { manifestUrl, ...rest } = formData;
    debouncedValidateManifestURl({
      formData: { manifestUrl: currentManifestUrl },
      ...validationHelpers,
    });
    setFormData({
      ...rest,
      manifestUrl: currentManifestUrl,
    });
    setSkillManifest(null);
  };

  const validateUrl = useCallback(
    async (event) => {
      event.preventDefault();
      setShowDetail(true);
      try {
        const { data } = await httpClient.get(`/projects/${projectId}/skill/retrieveSkillManifest`, {
          params: {
            url: formData.manifestUrl,
          },
        });
        setSkillManifest(data);
      } catch (error) {
        setFormDataErrors({ ...error, manifestUrl: formatMessage('Manifest url can not be accessed') });
      }
    },
    [projectId, formData]
  );

  const handleSubmit = (event, content: string, enable: boolean) => {
    event.preventDefault();
    // add a remote skill, add skill identifier into botProj file
    addRemoteSkill(formData.manifestUrl, formData.endpointName)
      .then(() => {
        TelemetryClient.track('AddNewSkillCompleted');
        const result = location.href.split('/');
        let skillId = '';
        if (result.length > 0) skillId = result[result.length - 1];
        // add trigger with connect to skill action to root bot
        const triggerFormData = getTriggerFormData(skillManifest.name, content);
        addTriggerToRoot(dialogId, triggerFormData, skillId);
        TelemetryClient.track('AddNewTriggerCompleted', { kind: 'Microsoft.OnIntent' });
      })
      .catch((err) => {
        console.log(err);
      });

    if (enable) {
      // update recognizor type to orchestrator
      updateRecognizer(projectId, dialogId, SDKKinds.OrchestratorRecognizer);
    }
  };

  useEffect(() => {
    if (skillManifest?.endpoints) {
      setFormData({
        ...formData,
        endpointName: skillManifest.endpoints[0].name,
      });
    }
  }, [skillManifest]);

  return (
    <DialogWrapper isOpen dialogType={DialogTypes.CreateFlow} onDismiss={onDismiss} {...title}>
      {showIntentSelectDialog ? (
        <SelectIntent
          dialogId={dialogId}
          languages={languages}
          luFeatures={luFeatures}
          manifest={skillManifest}
          projectId={projectId}
          rootLuFiles={luFiles}
          setTitle={setTitle}
          onBack={() => {
            setTitle({
              subText: '',
              title: addSkillDialog.SKILL_MANIFEST_FORM.title,
            });
            setShowIntentSelectDialog(false);
          }}
          onDismiss={onDismiss}
          onSubmit={handleSubmit}
        />
      ) : (
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
            <div style={{ width: '50%' }}>
              <TextField
                required
                errorMessage={formDataErrors.manifestUrl}
                label={formatMessage('Skill Manifest Url')}
                value={formData.manifestUrl || ''}
                onChange={handleManifestUrlChange}
              />
              {skillManifest?.endpoints?.length > 1 && (
                <Dropdown
                  label={formatMessage('Endpoints')}
                  options={options}
                  defaultSelectedKey={skillManifest.endpoints[0].msAppId}
                  responsiveMode={ResponsiveMode.large}
                  onChange={(e, option?: IDropdownOption) => {
                    if (option) {
                      setFormData({
                        ...formData,
                        endpointName: option.text,
                      });
                    }
                  }}
                />
              )}
            </div>
            {showDetail && (
              <Fragment>
                <Separator vertical styles={{ root: { padding: '0px 20px' } }} />
                <div style={{ minWidth: '50%' }}>
                  {skillManifest ? <SkillDetail manifest={skillManifest} /> : <LoadingSpinner />}
                </div>
              </Fragment>
            )}
          </Stack>
          <Stack>
            <Separator />
            <StackItem align={'end'}>
              <DefaultButton data-testid="SkillFormCancel" text={formatMessage('Cancel')} onClick={onDismiss} />
              {skillManifest ? (
                isUsingAdaptiveRuntime(runtime) && luFiles.length > 0 ? (
                  <PrimaryButton
                    styles={{ root: { marginLeft: '8px' } }}
                    text={formatMessage('Next')}
                    onClick={(event) => {
                      setTitle(selectIntentDialog.SELECT_INTENT(dialogId, skillManifest.name));
                      setShowIntentSelectDialog(true);
                    }}
                  />
                ) : (
                  <PrimaryButton
                    styles={{ root: { marginLeft: '8px' } }}
                    text={formatMessage('Done')}
                    onClick={(event) => {
                      addRemoteSkill(formData.manifestUrl, formData.endpointName);
                    }}
                  />
                )
              ) : (
                <PrimaryButton
                  disabled={!formData.manifestUrl || formDataErrors.manifestUrl !== undefined}
                  styles={{ root: { marginLeft: '8px' } }}
                  text={formatMessage('Next')}
                  onClick={validateUrl}
                />
              )}
            </StackItem>
          </Stack>
        </Fragment>
      )}
    </DialogWrapper>
  );
};

export default CreateSkillModal;
