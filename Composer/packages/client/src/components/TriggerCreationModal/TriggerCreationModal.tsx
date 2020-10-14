// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { SDKKinds } from '@bfc/shared';
import { useRecoilValue } from 'recoil';

import { TriggerFormData, TriggerFormDataErrors } from '../../utils/dialogUtil';
import { userSettingsState } from '../../recoilModel/atoms';
import { validateDialogSelectorFamily } from '../../recoilModel';
import { isRegExRecognizerType, resolveRecognizer$kind } from '../../utils/dialogValidator';

import { optionStyles, dialogContentStyles, modalStyles, dialogWindowStyles, warningIconStyles } from './styles';
import { validateForm } from './validators';
import { resolveTriggerWidget } from './resolveTriggerWidget';
import { TriggerDropdownGroup } from './TriggerDropdownGroup';

export const renderDropdownOption = (option?: IDropdownOption) => {
  if (!option) return null;
  return (
    <div css={optionStyles}>
      {option.text}
      {option.data && option.data.icon && <Icon iconName={option.data.icon} style={warningIconStyles} />}
    </div>
  );
};

const hasError = (errors: TriggerFormDataErrors) => Object.values(errors).some((msg) => !!msg);

export const initialFormData: TriggerFormData = {
  errors: {},
  $kind: SDKKinds.OnIntent,
  event: '',
  intent: '',
  triggerPhrases: '',
  regEx: '',
};

interface TriggerCreationModalProps {
  projectId: string;
  dialogId: string;
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (dialogId: string, formData: TriggerFormData) => void;
}

export const TriggerCreationModal: React.FC<TriggerCreationModalProps> = (props) => {
  const { isOpen, onDismiss, onSubmit, dialogId, projectId } = props;
  const dialogs = useRecoilValue(validateDialogSelectorFamily(projectId));

  const userSettings = useRecoilValue(userSettingsState);
  const dialogFile = dialogs.find((dialog) => dialog.id === dialogId);
  const recognizer$kind = resolveRecognizer$kind(dialogFile);
  const isRegEx = isRegExRecognizerType(dialogFile);
  const regexIntents = dialogFile?.content?.recognizer?.intents ?? [];

  const [formData, setFormData] = useState(initialFormData);
  const [selectedType, setSelectedType] = useState<string>(SDKKinds.OnIntent);

  const onClickSubmitButton = (e) => {
    e.preventDefault();

    const errors = validateForm(selectedType, formData, isRegEx, regexIntents);
    if (hasError(errors)) {
      setFormData({ ...formData, errors });
      return;
    }
    onDismiss();
    onSubmit(dialogId, { ...formData, $kind: selectedType });
  };

  const errors = validateForm(selectedType, formData, isRegEx, regexIntents);
  const disable = hasError(errors);

  const triggerWidget = resolveTriggerWidget(
    selectedType,
    dialogFile,
    formData,
    setFormData,
    userSettings,
    projectId,
    dialogId
  );

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Create a trigger'),
        styles: dialogContentStyles,
      }}
      hidden={!isOpen}
      modalProps={{
        isBlocking: false,
        styles: modalStyles,
      }}
      onDismiss={onDismiss}
    >
      <div css={dialogWindowStyles}>
        <TriggerDropdownGroup
          recognizerType={recognizer$kind}
          setTriggerType={setSelectedType}
          triggerType={selectedType}
        />
        {triggerWidget}
      </div>
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        <PrimaryButton
          data-testid={'triggerFormSubmit'}
          disabled={disable}
          text={formatMessage('Submit')}
          onClick={onClickSubmitButton}
        />
      </DialogFooter>
    </Dialog>
  );
};

export default TriggerCreationModal;
