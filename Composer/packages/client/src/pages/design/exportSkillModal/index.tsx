// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { JSONSchema7 } from '@bfc/extension-client';
import { Link } from 'office-ui-fabric-react/lib/components/Link';
import { useRecoilValue } from 'recoil';
import { SkillManifestFile } from '@bfc/shared';
import { navigate } from '@reach/router';

import {
  dispatcherState,
  skillManifestsState,
  qnaFilesSelectorFamily,
  dialogsSelectorFamily,
  dialogSchemasState,
  currentTargetState,
  luFilesSelectorFamily,
  settingsState,
  rootBotProjectIdSelector,
} from '../../../recoilModel';

import { styles } from './styles';
import { generateSkillManifest } from './generateSkillManifest';
import { editorSteps, ManifestEditorSteps, order } from './constants';
import { mergePropertiesManagedByRootBot } from '../../../recoilModel/dispatchers/utils/project';
import { cloneDeep } from 'lodash';
import { isUsingAdaptiveRuntime } from '@bfc/shared';

interface ExportSkillModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: () => void;
  projectId: string;
}

const ExportSkillModal: React.FC<ExportSkillModalProps> = ({ onSubmit, onDismiss: handleDismiss, projectId }) => {
  const dialogs = useRecoilValue(dialogsSelectorFamily(projectId));
  const dialogSchemas = useRecoilValue(dialogSchemasState(projectId));
  const currentTarget = useRecoilValue(currentTargetState(projectId));
  const luFiles = useRecoilValue(luFilesSelectorFamily(projectId));
  const qnaFiles = useRecoilValue(qnaFilesSelectorFamily(projectId));
  const skillManifests = useRecoilValue(skillManifestsState(projectId));
  const { updateSkillManifest } = useRecoilValue(dispatcherState);

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [schema, setSchema] = useState<JSONSchema7>({});

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

  const updateAllowedCallers = React.useCallback(
    (allowedCallers: string[] = []) => {
      const updatedSetting = isAdaptive
        ? {
            ...cloneDeep(mergedSettings),
            runtimeSettings: { ...runtimeSettings, skills: { ...runtimeSettings.skills, allowedCallers } },
          }
        : {
            ...cloneDeep(mergedSettings),
            skillConfiguration: { ...skillConfiguration, allowedCallers },
          };
      setSettings(projectId, updatedSetting);
    },
    [mergedSettings, projectId, isAdaptive, skillConfiguration, runtimeSettings]
  );

  const handleGenerateManifest = () => {
    const manifest = generateSkillManifest(
      schema,
      skillManifest,
      dialogs,
      dialogSchemas,
      luFiles,
      qnaFiles,
      selectedTriggers,
      selectedDialogs,
      currentTarget,
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

  const handleTriggerPublish = async () => {
    const filePath = `https://${JSON.parse(currentTarget.configuration).hostname}.azurewebsites.net/manifests/${
      skillManifest.id
    }.json`;
    navigate(`/bot/${projectId}/publish/all?publishTargetName=${currentTarget.name}&url=${filePath}`);
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
      currentTarget,
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
      hidden={false}
      modalProps={{
        isBlocking: false,
        styles: styles.modal,
      }}
      onDismiss={handleDismiss}
    >
      <div css={styles.container}>
        <p>
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
            callers={callers}
            setCallers={setCallers}
            onChange={(manifestContent) => setSkillManifest({ ...skillManifest, content: manifestContent })}
          />
        </div>
        <DialogFooter>
          <div css={styles.buttonContainer}>
            <div>
              {buttons.map(({ disabled, primary, text, onClick }, index) => {
                const Button = primary ? PrimaryButton : DefaultButton;

                let isDisabled = false;
                if (typeof disabled === 'function') {
                  isDisabled =
                    editorStep === ManifestEditorSteps.SELECT_MANIFEST
                      ? disabled({ manifest: skillManifest })
                      : disabled({ publishTargets });
                } else {
                  isDisabled = !!disabled;
                }

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
