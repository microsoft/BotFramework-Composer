// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { FontSizes } from '@uifabric/fluent-theme';
import { useRecoilValue } from 'recoil';
import debounce from 'lodash/debounce';
import { isUsingAdaptiveRuntime, SDKKinds } from '@bfc/shared';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { Separator } from 'office-ui-fabric-react/lib/Separator';
import { Dropdown, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react/lib/Dropdown';
import { FontWeights } from 'office-ui-fabric-react/lib/Styling';
import { JSZipObject } from 'jszip';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  settingsState,
  designPageLocationState,
  dispatcherState,
  luFilesSelectorFamily,
  publishTypesState,
  botProjectFileState,
} from '../../recoilModel';
import { addSkillDialog } from '../../constants';
import httpClient from '../../utils/httpUtil';
import TelemetryClient from '../../telemetry/TelemetryClient';
import { TriggerFormData } from '../../utils/dialogUtil';
import { selectIntentDialog } from '../../constants';
import { isShowAuthDialog } from '../../utils/auth';
import { AuthDialog } from '../Auth/AuthDialog';
import { PublishProfileDialog } from '../../pages/botProject/create-publish-profile/PublishProfileDialog';

import { SelectIntent } from './SelectIntent';
import { SkillDetail } from './SkillDetail';
import { SetAppId } from './SetAppId';
import { BrowserModal } from './BrowserModal';

export interface SkillFormDataErrors {
  endpoint?: string;
  manifestUrl?: string;
  name?: string;
}

const urlRegex = /^http[s]?:\/\/\w+/;
const filePathRegex = /([^<>/\\:""]+\.\w+$)/;
export const skillNameRegex = /^\w[-\w]*$/;
export const msAppIdRegex = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/;

export interface CreateSkillModalProps {
  projectId: string;
  addRemoteSkill: (manifestUrl: string, endpointName: string, zipContent: Record<string, any>) => Promise<void>;
  addTriggerToRoot: (dialogId: string, triggerFormData: TriggerFormData, skillId: string) => Promise<void>;
  onDismiss: () => void;
}

export const validateManifestUrl = ({ formData, formDataErrors, setFormDataErrors }, skills: string[] = []) => {
  const { manifestUrl } = formData;
  const { manifestUrl: _, ...errors } = formDataErrors;

  if (!manifestUrl) {
    setFormDataErrors({ ...errors, manifestUrl: formatMessage('Please input a manifest URL') });
  } else if (!urlRegex.test(manifestUrl) && !filePathRegex.test(manifestUrl)) {
    setFormDataErrors({
      ...errors,
      manifestUrl: formatMessage('URL should start with http:// or https:// or file path of your system'),
    });
  } else if (skills.includes(manifestUrl)) {
    setFormDataErrors({
      ...errors,
      manifestUrl: formatMessage('The bot is already part of the Bot Project'),
    });
  } else {
    setFormDataErrors({});
  }
};

export const getSkillManifest = async (projectId: string, manifestUrl: string, setSkillManifest, setFormDataErrors) => {
  try {
    const { data } = await httpClient.get(`/projects/${projectId}/skill/retrieveSkillManifest`, {
      params: {
        url: manifestUrl,
      },
    });
    setSkillManifest(data);
  } catch (error) {
    const httpMessage = error?.response?.data?.message;
    const message = httpMessage?.match('Unexpected string in JSON')
      ? formatMessage('Error attempting to parse Skill manifest. There could be an error in its format.')
      : formatMessage('Manifest URL can not be accessed');

    setFormDataErrors({ ...error, manifestUrl: message });
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

const buttonStyle = { root: { marginLeft: '8px' } };

const setAppIdDialogStyles = {
  dialog: {
    title: {
      fontWeight: FontWeights.bold,
      fontSize: FontSizes.size20,
      paddingTop: '14px',
      paddingBottom: '11px',
    },
    subText: {
      fontSize: FontSizes.size14,
      marginBottom: '0px',
    },
  },
  modal: {
    main: {
      maxWidth: '80% !important',
      width: '960px !important',
    },
  },
};
export const CreateSkillModal: React.FC<CreateSkillModalProps> = (props) => {
  const { projectId, addRemoteSkill, addTriggerToRoot, onDismiss } = props;

  const [title, setTitle] = useState(addSkillDialog.SET_APP_ID);
  const [showSetAppIdDialog, setShowSetAppIdDialog] = useState(true);
  const [showIntentSelectDialog, setShowIntentSelectDialog] = useState(false);
  const [formData, setFormData] = useState<{ manifestUrl: string; endpointName: string }>({
    manifestUrl: '',
    endpointName: '',
  });
  const [formDataErrors, setFormDataErrors] = useState<SkillFormDataErrors>({});
  const [skillManifest, setSkillManifest] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [createSkillDialogHidden, setCreateSkillDialogHidden] = useState(false);
  const [manifestDirPath, setManifestDirPath] = useState('');
  const [zipContent, setZipContent] = useState({});

  const publishTypes = useRecoilValue(publishTypesState(projectId));
  const { languages, luFeatures, runtime, publishTargets = [], MicrosoftAppId } = useRecoilValue(
    settingsState(projectId)
  );
  const { dialogId } = useRecoilValue(designPageLocationState(projectId));
  const luFiles = useRecoilValue(luFilesSelectorFamily(projectId));
  const { updateRecognizer, setMicrosoftAppProperties, setPublishTargets } = useRecoilValue(dispatcherState);
  const { content: botProjectFile } = useRecoilValue(botProjectFileState(projectId));
  const skillUrls = Object.keys(botProjectFile.skills).map((key) => botProjectFile.skills[key].manifest as string);

  const debouncedValidateManifestURl = useRef(debounce(validateManifestUrl, 500)).current;

  const validationHelpers = {
    formDataErrors,
    setFormDataErrors,
  };

  const options: IDropdownOption[] = useMemo(() => {
    return skillManifest?.endpoints?.map((item) => {
      return {
        key: item.name,
        // eslint-disable-next-line format-message/literal-pattern
        text: formatMessage(item.name),
      };
    });
  }, [skillManifest]);

  const handleManifestUrlChange = (_, currentManifestUrl = '') => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { manifestUrl, ...rest } = formData;
    debouncedValidateManifestURl(
      {
        formData: { manifestUrl: currentManifestUrl },
        ...validationHelpers,
      },
      skillUrls
    );
    setFormData({
      ...rest,
      manifestUrl: currentManifestUrl,
    });
    setSkillManifest(null);
    setShowDetail(false);
  };

  const validateUrl = useCallback(
    (event) => {
      event.preventDefault();
      setShowDetail(true);
      getSkillManifest(projectId, formData.manifestUrl, setSkillManifest, setFormDataErrors);
    },
    [projectId, formData]
  );

  const validateLocalZip = useCallback(async (files: Record<string, JSZipObject>) => {
    try {
      // get manifest
      const manifestFiles: JSZipObject[] = [];
      const zipContent: Record<string, string> = {};
      for (const fPath in files) {
        if (fPath.match(/\.([^\.]+)$/)?.[1] === 'json') {
          manifestFiles.push(files[fPath]);
          setManifestDirPath(fPath.substr(0, fPath.lastIndexOf('/') + 1));
        }
        zipContent[fPath] = await files[fPath].async('string');
      }

      // update content for detail panel and show it
      if (manifestFiles.length > 1) {
        setFormDataErrors({ manifestUrl: formatMessage('zip folder has multiply manifest json') });
      } else if (manifestFiles.length === 1) {
        const content = await manifestFiles[0].async('string');
        setSkillManifest(JSON.parse(content));
        setFormDataErrors({});
        setZipContent(zipContent);
      }
      setShowDetail(true);
    } catch (err) {
      // eslint-disable-next-line format-message/literal-pattern
      setFormDataErrors({ manifestUrl: formatMessage(err.toString()) });
    }
  }, []);

  const handleSubmit = async (event, content: string, enable: boolean) => {
    event.preventDefault();
    // add a remote skill, add skill identifier into botProj file
    await addRemoteSkill(formData.manifestUrl, formData.endpointName, zipContent);
    TelemetryClient.track('AddNewSkillCompleted');
    // if added remote skill fail, just not addTrigger to root.
    const skillId = location.href.match(/skill\/([^/]*)/)?.[1];
    if (skillId) {
      // add trigger with connect to skill action to root bot
      const triggerFormData = getTriggerFormData(skillManifest.name, content);
      await addTriggerToRoot(dialogId, triggerFormData, skillId);
      TelemetryClient.track('AddNewTriggerCompleted', { kind: 'Microsoft.OnIntent' });
    }

    if (enable) {
      // update recognizor type to orchestrator
      await updateRecognizer(projectId, dialogId, SDKKinds.OrchestratorRecognizer);
    }
  };

  const handleDismiss = () => {
    setShowSetAppIdDialog(true);
    onDismiss();
  };

  const handleGotoAddSkill = (publishTargetName: string) => {
    const profileTarget = publishTargets.find((target) => target.name === publishTargetName);
    const configuration = JSON.parse(profileTarget?.configuration || '');
    setMicrosoftAppProperties(
      projectId,
      configuration.settings.MicrosoftAppId,
      configuration.settings.MicrosoftAppPassword
    );

    setShowSetAppIdDialog(false);
    setTitle({
      subText: '',
      title: addSkillDialog.SKILL_MANIFEST_FORM.title,
    });
  };

  const handleGotoCreateProfile = () => {
    isShowAuthDialog(true) ? setShowAuthDialog(true) : setCreateSkillDialogHidden(true);
  };

  useEffect(() => {
    if (skillManifest?.endpoints) {
      setFormData({
        ...formData,
        endpointName: skillManifest.endpoints[0].name,
      });
    }
  }, [skillManifest]);

  useEffect(() => {
    if (MicrosoftAppId) {
      setShowSetAppIdDialog(false);
      setTitle({
        subText: '',
        title: addSkillDialog.SKILL_MANIFEST_FORM.title,
      });
    }
  }, [MicrosoftAppId]);

  return (
    <Fragment>
      <DialogWrapper
        dialogType={showSetAppIdDialog ? DialogTypes.Customer : DialogTypes.CreateFlow}
        isOpen={!createSkillDialogHidden}
        onDismiss={handleDismiss}
        {...title}
        customerStyle={setAppIdDialogStyles}
      >
        {showSetAppIdDialog && (
          <Fragment>
            <Separator styles={{ root: { marginBottom: '20px' } }} />
            <SetAppId
              projectId={projectId}
              onDismiss={handleDismiss}
              onGotoCreateProfile={handleGotoCreateProfile}
              onNext={handleGotoAddSkill}
            />
          </Fragment>
        )}
        {showIntentSelectDialog && (
          <SelectIntent
            dialogId={dialogId}
            languages={languages}
            luFeatures={luFeatures}
            manifest={skillManifest}
            manifestDirPath={manifestDirPath}
            projectId={projectId}
            rootLuFiles={luFiles}
            zipContent={zipContent}
            onBack={() => {
              setTitle({
                subText: '',
                title: addSkillDialog.SKILL_MANIFEST_FORM.title,
              });
              setShowIntentSelectDialog(false);
            }}
            onDismiss={handleDismiss}
            onSubmit={handleSubmit}
            onUpdateTitle={setTitle}
          />
        )}
        {!showIntentSelectDialog && !showSetAppIdDialog && (
          <Fragment>
            <div style={{ marginBottom: '16px' }}>
              {addSkillDialog.SKILL_MANIFEST_FORM.subText('https://aka.ms/bf-composer-docs-publish-bot')}
            </div>
            <Separator />
            <Stack horizontal horizontalAlign="start" styles={{ root: { height: 300 } }}>
              <div style={{ width: '50%' }}>
                <div style={{ display: 'flex' }}>
                  <TextField
                    required
                    errorMessage={formDataErrors.manifestUrl}
                    label={formatMessage('Skill Manifest URL')}
                    placeholder={formatMessage('Ask the skill owner for the URL and provide your bot’s App ID')}
                    styles={{ root: { width: '300px' } }}
                    value={formData.manifestUrl || ''}
                    onChange={handleManifestUrlChange}
                  />
                  <BrowserModal
                    onUpdate={(path: string, files: Record<string, JSZipObject>) => {
                      // update path in input field
                      setFormData({
                        ...formData,
                        manifestUrl: path,
                      });

                      validateLocalZip(files);
                    }}
                  />
                </div>
                {skillManifest?.endpoints?.length > 1 && (
                  <Dropdown
                    defaultSelectedKey={skillManifest.endpoints[0].name}
                    label={formatMessage('Endpoints')}
                    options={options}
                    responsiveMode={ResponsiveMode.large}
                    onChange={(e, option?: IDropdownOption) => {
                      if (option) {
                        setFormData({
                          ...formData,
                          endpointName: option.key as string,
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
                  isUsingAdaptiveRuntime(runtime) &&
                  luFiles.length > 0 &&
                  skillManifest.dispatchModels?.intents?.length > 0 ? (
                    <PrimaryButton
                      disabled={formDataErrors.manifestUrl ? true : false}
                      styles={buttonStyle}
                      text={formatMessage('Next')}
                      onClick={(event) => {
                        setTitle(selectIntentDialog.SELECT_INTENT(dialogId, skillManifest.name));
                        setShowIntentSelectDialog(true);
                      }}
                    />
                  ) : (
                    <PrimaryButton
                      styles={buttonStyle}
                      text={formatMessage('Done')}
                      onClick={(event) => {
                        addRemoteSkill(formData.manifestUrl, formData.endpointName, zipContent);
                      }}
                    />
                  )
                ) : (
                  <PrimaryButton
                    disabled={!formData.manifestUrl || formDataErrors.manifestUrl !== undefined}
                    styles={buttonStyle}
                    text={formatMessage('Next')}
                    onClick={validateUrl}
                  />
                )}
              </StackItem>
            </Stack>
          </Fragment>
        )}
      </DialogWrapper>
      {showAuthDialog && (
        <AuthDialog
          needGraph
          next={() => {
            setCreateSkillDialogHidden(true);
          }}
          onDismiss={() => {
            setShowAuthDialog(false);
          }}
        />
      )}
      {createSkillDialogHidden ? (
        <PublishProfileDialog
          closeDialog={() => {
            setCreateSkillDialogHidden(false);
          }}
          current={null}
          projectId={projectId}
          setPublishTargets={setPublishTargets}
          targets={publishTargets || []}
          types={publishTypes}
        />
      ) : null}
    </Fragment>
  );
};

export default CreateSkillModal;
