// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useEffect, useRef, useState } from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { JSONSchema7 } from '@bfc/extension-client';
import { Link } from 'office-ui-fabric-react/lib/components/Link';
import { useRecoilValue } from 'recoil';
import { PublishTarget, SkillManifestFile } from '@bfc/shared';
import { navigate } from '@reach/router';
import { isUsingAdaptiveRuntime } from '@bfc/shared';
import cloneDeep from 'lodash/cloneDeep';

import { Notification } from '../../../recoilModel/types';
import {
  dispatcherState,
  skillManifestsState,
  qnaFilesSelectorFamily,
  dialogsSelectorFamily,
  dialogSchemasState,
  currentPublishTargetState,
  luFilesSelectorFamily,
  settingsState,
  rootBotProjectIdSelector,
} from '../../../recoilModel';
import {
  getSensitiveProperties,
  mergePropertiesManagedByRootBot,
} from '../../../recoilModel/dispatchers/utils/project';
import { getTokenFromCache } from '../../../utils/auth';
import { ApiStatus, PublishStatusPollingUpdater } from '../../../utils/publishStatusPollingUpdater';
import {
  getSkillPublishedNotificationCardProps,
  getSkillPendingNotificationCardProps,
} from '../../publish/Notifications';
import { createNotification } from '../../../recoilModel/dispatchers/notification';
import { getManifestUrl } from '../../../utils/skillManifestUtil';

import { editorSteps, ManifestEditorSteps, order } from './constants';
import { generateSkillManifest } from './generateSkillManifest';
import { styles } from './styles';

interface ExportSkillModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: () => void;
  projectId: string;
}

const ExportSkillModal: React.FC<ExportSkillModalProps> = ({ onSubmit, onDismiss: handleDismiss, projectId }) => {
  const dialogs = useRecoilValue(dialogsSelectorFamily(projectId));
  const dialogSchemas = useRecoilValue(dialogSchemasState(projectId));
  const currentPublishTarget = useRecoilValue(currentPublishTargetState(projectId));
  const luFiles = useRecoilValue(luFilesSelectorFamily(projectId));
  const qnaFiles = useRecoilValue(qnaFilesSelectorFamily(projectId));
  const skillManifests = useRecoilValue(skillManifestsState(projectId));
  const { updateSkillManifest, publishToTarget, addNotification, updateNotification } = useRecoilValue(dispatcherState);

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [schema, setSchema] = useState<JSONSchema7>({});
  const [isHidden, setIsHidden] = useState(false);

  const [skillManifest, setSkillManifest] = useState<Partial<SkillManifestFile>>({});
  const { content = {}, id } = skillManifest;

  const [selectedDialogs, setSelectedDialogs] = useState<any[]>([]);
  const [selectedTriggers, setSelectedTriggers] = useState<any[]>([]);

  const editorStep = order[currentStep];
  const { buttons = [], content: Content, editJson, helpLink, subText, title, validate } = editorSteps[editorStep];

  const settings = useRecoilValue(settingsState(projectId));
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || '';
  const mergedSettings = mergePropertiesManagedByRootBot(projectId, rootBotProjectId, settings);
  const { skillConfiguration, runtime, runtimeSettings, publishTargets } = mergedSettings;
  const { setSettings } = useRecoilValue(dispatcherState);
  const isAdaptive = isUsingAdaptiveRuntime(runtime);
  const [callers, setCallers] = useState<string[]>(
    !isAdaptive ? skillConfiguration?.allowedCallers : runtimeSettings?.skills?.allowedCallers ?? []
  );

  const [isCreateProfileFromSkill, setIsCreateProfileFromSkill] = useState(false);
  const publishUpdaterRef = useRef<PublishStatusPollingUpdater>();
  const publishNotificationRef = useRef<Notification>();
  const resetDialog = () => {
    handleDismiss();
    setIsHidden(false);
  };
  // stop polling updater
  const stopUpdater = () => {
    publishUpdaterRef.current && publishUpdaterRef.current.stop();
    publishUpdaterRef.current = undefined;
    resetDialog();
  };

  const deleteNotificationCard = async () => {
    publishNotificationRef.current = undefined;
  };
  const changeNotificationStatus = async (data) => {
    const { apiResponse } = data;
    if (!apiResponse) {
      stopUpdater();
      deleteNotificationCard();
      return;
    }
    const responseData = apiResponse.data;

    if (responseData.status !== ApiStatus.Publishing) {
      // Show result notifications
      const displayedNotification = publishNotificationRef.current;
      const publishUpdater = publishUpdaterRef.current;
      if (displayedNotification && publishUpdater) {
        const currentTarget = publishTargets?.find((target) => target.name === publishUpdater.getPublishTargetName());
        const url = currentTarget
          ? getManifestUrl(JSON.parse(currentTarget.configuration).hostname, skillManifest)
          : '';
        const notificationCard = getSkillPublishedNotificationCardProps({ ...responseData }, url);
        updateNotification(displayedNotification.id, notificationCard);
      }
      stopUpdater();
    }
  };

  useEffect(() => {
    const publish = async () => {
      try {
        if (!publishTargets || publishTargets.length === 0) return;
        const currentTarget = publishTargets.find((item) => {
          const config = JSON.parse(item.configuration);
          return (
            config.settings &&
            config.settings.MicrosoftAppId &&
            config.hostname &&
            config.settings.MicrosoftAppId.length > 0 &&
            config.hostname.length > 0
          );
        });
        if (isCreateProfileFromSkill && currentTarget) {
          handleGenerateManifest(currentTarget);
          const skillPublishPenddingNotificationCard = getSkillPendingNotificationCardProps();
          publishNotificationRef.current = createNotification(skillPublishPenddingNotificationCard);
          addNotification(publishNotificationRef.current);
          const sensitiveSettings = getSensitiveProperties(settings);
          const token = getTokenFromCache('accessToken');
          await publishToTarget(projectId, currentTarget, { comment: '' }, sensitiveSettings, token);
          publishUpdaterRef.current = new PublishStatusPollingUpdater(projectId, currentTarget.name);
          publishUpdaterRef.current.start(changeNotificationStatus);
        }
      } catch (e) {
        console.log(e.message);
      }
    };
    publish();
  }, [isCreateProfileFromSkill, publishTargets?.length]);
  useEffect(() => {
    isCreateProfileFromSkill && setIsHidden(true);
  }, [isCreateProfileFromSkill]);

  useEffect(() => {
    // Clear intervals when unmount
    return () => {
      if (publishUpdaterRef.current) {
        stopUpdater();
      }
      if (publishNotificationRef.current) {
        deleteNotificationCard();
      }
    };
  }, []);

  const updateAllowedCallers = React.useCallback(
    (allowedCallers: string[] = []) => {
      const updatedSetting = isAdaptive
        ? {
            ...cloneDeep(mergedSettings),
            runtimeSettings: { ...runtimeSettings, skills: { ...runtimeSettings?.skills, allowedCallers } },
          }
        : {
            ...cloneDeep(mergedSettings),
            skillConfiguration: { ...skillConfiguration, allowedCallers },
          };
      setSettings(projectId, updatedSetting);
    },
    [mergedSettings, projectId, isAdaptive, skillConfiguration, runtimeSettings]
  );

  const handleGenerateManifest = (currentTarget?: PublishTarget) => {
    const manifest = generateSkillManifest(
      schema,
      skillManifest,
      dialogs,
      dialogSchemas,
      luFiles,
      qnaFiles,
      selectedTriggers,
      selectedDialogs,
      currentTarget || currentPublishTarget,
      projectId
    );
    setSkillManifest(manifest);
    if (manifest.content && manifest.id) {
      updateSkillManifest(manifest as SkillManifestFile, projectId);
    }
  };

  const handleEditJson = () => {
    const step = order.findIndex((step) => step === ManifestEditorSteps.MANIFEST_REVIEW);
    if (step >= 0) {
      setCurrentStep(step);
      setErrors({});
    }
  };

  const handleTriggerPublish = () => {
    const filePath = `https://${JSON.parse(currentPublishTarget.configuration).hostname}.azurewebsites.net/manifests/${
      skillManifest.id
    }.json`;
    navigate(`/bot/${projectId}/publish/all?publishTargetName=${currentPublishTarget.name}&url=${filePath}`);
  };

  const handleSave = () => {
    const manifest = generateSkillManifest(
      schema,
      skillManifest,
      dialogs,
      dialogSchemas,
      luFiles,
      qnaFiles,
      selectedTriggers,
      selectedDialogs,
      currentPublishTarget,
      projectId
    );
    if (manifest.content && manifest.id) {
      updateSkillManifest(manifest as SkillManifestFile, projectId);
    }
  };

  const onSaveSkill = () => {
    updateAllowedCallers(callers);
  };

  const handleNext = (options?: { dismiss?: boolean; id?: string; save?: boolean }) => {
    const validated = typeof validate === 'function' ? validate({ content, id, schema, skillManifests }) : errors;

    if (!Object.keys(validated).length) {
      setCurrentStep((current) => (current + 1 < order.length ? current + 1 : current));
      options?.save && handleSave();
      options?.dismiss && handleDismiss();
      setErrors({});
    } else {
      setErrors(validated);
    }
  };

  const handleBack = () => {
    setCurrentStep((current) => (current > 0 ? current - 1 : current));
  };

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.close,
        title: title(),
        styles: styles.dialog,
      }}
      hidden={isHidden}
      modalProps={{
        isBlocking: false,
        styles: styles.modal,
      }}
      onDismiss={handleDismiss}
    >
      <div css={styles.container}>
        <p style={{ height: '38px' }}>
          {typeof subText === 'function' && subText()}
          {helpLink && (
            <React.Fragment>
              {!!subText && <React.Fragment>&nbsp;</React.Fragment>}
              <Link href={helpLink} rel="noopener noreferrer" target="_blank">
                {formatMessage('Learn more')}
              </Link>
            </React.Fragment>
          )}
        </p>
        <div
          css={{
            ...styles.content,
            overflow: order[currentStep] === ManifestEditorSteps.MANIFEST_DESCRIPTION ? 'auto' : 'hidden',
          }}
        >
          <Content
            callers={callers}
            completeStep={handleNext}
            editJson={handleEditJson}
            errors={errors}
            manifest={skillManifest}
            projectId={projectId}
            schema={schema}
            selectedDialogs={selectedDialogs}
            selectedTriggers={selectedTriggers}
            setErrors={setErrors}
            setSchema={setSchema}
            setSelectedDialogs={setSelectedDialogs}
            setSelectedTriggers={setSelectedTriggers}
            setSkillManifest={setSkillManifest}
            skillManifests={skillManifests}
            value={content}
            onChange={(manifestContent) => setSkillManifest({ ...skillManifest, content: manifestContent })}
            onUpdateCallers={setCallers}
            onUpdateIsCreateProfileFromSkill={setIsCreateProfileFromSkill}
          />
        </div>
        <DialogFooter>
          <div css={styles.buttonContainer}>
            <div>
              {buttons.map(({ disabled, primary, text, onClick }, index) => {
                const Button = primary ? PrimaryButton : DefaultButton;

                const isDisabled =
                  typeof disabled === 'function' ? disabled({ publishTarget: currentPublishTarget }) : !!disabled;

                return (
                  <Button
                    key={index}
                    disabled={isDisabled}
                    styles={{ root: { marginLeft: '8px' } }}
                    text={text()}
                    onClick={onClick({
                      generateManifest: handleGenerateManifest,
                      setCurrentStep,
                      manifest: skillManifest,
                      onDismiss: handleDismiss,
                      onNext: handleNext,
                      onBack: handleBack,
                      onSave: handleSave,
                      onPublish: handleTriggerPublish,
                      onSubmit,
                      onSaveSkill,
                    })}
                  />
                );
              })}
            </div>
            {editJson && <DefaultButton text={formatMessage('Edit in JSON')} onClick={handleEditJson} />}
          </div>
        </DialogFooter>
      </div>
    </Dialog>
  );
};

export default ExportSkillModal;
