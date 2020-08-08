// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useMemo, useState } from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { JSONSchema7 } from '@bfc/extension';
import { Link } from 'office-ui-fabric-react/lib/components/Link';
import { useRecoilValue } from 'recoil';
import { SkillManifest } from '@bfc/shared';

import { skillManifestsState, dispatcherState } from '../../../recoilModel';

import { editorSteps, ManifestEditorSteps, order } from './constants';
import { styles } from './styles';

interface ExportSkillModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: () => void;
}

const ExportSkillModal: React.FC<ExportSkillModalProps> = ({ onSubmit, onDismiss }) => {
  const skillManifests = useRecoilValue(skillManifestsState);
  const { updateSkillManifest } = useRecoilValue(dispatcherState);

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [schema, setSchema] = useState<JSONSchema7>({});

  const [selectedManifest, setSelectedManifest] = useState<string>('');
  const skillManifest = useMemo(() => skillManifests.find(({ id }) => id === selectedManifest), [
    selectedManifest,
    skillManifests,
  ]);
  const { content = {} } = skillManifest || {};

  const editorStep = order[currentStep];
  const { buttons = [], content: Content, editJson, helpLink, subText, title, validate } = editorSteps[editorStep];

  const handleEditJson = () => {
    const step = order.findIndex((step) => step === ManifestEditorSteps.MANIFEST_REVIEW);
    if (step >= 0) {
      setCurrentStep(step);
      setErrors({});
    }
  };

  const handleNext = () => {
    const validated = typeof validate === 'function' ? validate(content, schema) : errors;

    if (!Object.keys(validated).length) {
      setCurrentStep((current) => (current + 1 < order.length ? current + 1 : current));
      setErrors({});
    } else {
      setErrors(validated);
    }
  };

  const handleSave = (manifest?: SkillManifest) => {
    updateSkillManifest(manifest || content);
  };

  const handleSelectManifest = (manifest) => {
    setSelectedManifest(manifest);
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
      onDismiss={onDismiss}
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
        <div css={styles.content}>
          <Content
            completeStep={handleNext}
            editJson={handleEditJson}
            errors={errors}
            schema={schema}
            setErrors={setErrors}
            setSchema={setSchema}
            setSkillManifest={handleSelectManifest}
            skillManifests={skillManifests as SkillManifest[]}
            value={content}
            onChange={(manifestContent) => updateSkillManifest({ ...skillManifest, content: manifestContent })}
          />
        </div>
        <DialogFooter>
          <div css={styles.buttonContainer}>
            <div>
              {buttons.map(({ disabled, primary, text, onClick }, index) => {
                const Button = primary ? PrimaryButton : DefaultButton;
                const buttonText = text();
                const isDisabled = typeof disabled === 'function' ? disabled({ manifest: skillManifest }) : !!disabled;

                return (
                  <Button
                    key={index}
                    disabled={isDisabled}
                    styles={{ root: { marginLeft: '8px' } }}
                    text={buttonText}
                    onClick={onClick({
                      setCurrentStep,
                      onDismiss,
                      onNext: handleNext,
                      onSave: handleSave,
                      onSubmit,
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
