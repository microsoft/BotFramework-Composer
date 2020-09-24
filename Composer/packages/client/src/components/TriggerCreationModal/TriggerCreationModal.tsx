// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { SDKKinds } from '@bfc/shared';
import { useRecoilValue } from 'recoil';

import { TriggerFormData, TriggerFormDataErrors } from '../../utils/dialogUtil';
import { userSettingsState } from '../../recoilModel/atoms';
import { validateDialogSelectorFamily } from '../../recoilModel';
import { isRegExRecognizerType, resolveRecognizer$kind } from '../../utils/dialogValidator';

import { eventTypeKey, customEventKey, intentTypeKey, activityTypeKey } from './constants';
import {
  optionStyles,
  dialogContentStyles,
  modalStyles,
  dialogWindowStyles,
  dropdownStyles,
  warningIconStyles,
} from './styles';
import { validateForm, validateEventKind } from './validators';
import { getEventOptions, getActivityOptions, getTriggerOptions } from './getDropdownOptions';
import { resolveTriggerWidget } from './resolveTriggerWidget';

const renderDropdownOption = (option?: IDropdownOption) => {
  if (!option) return null;
  return (
    <div css={optionStyles}>
      {option.text}
      {option.data && option.data.icon && <Icon iconName={option.data.icon} style={warningIconStyles} />}
    </div>
  );
};

const hasError = (errors: TriggerFormDataErrors) => Object.values(errors).some((msg) => !!msg);

const initialFormData: TriggerFormData = {
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
  const [selectedType, setSelectedType] = useState<string>(intentTypeKey);
  const showEventDropDown = selectedType === eventTypeKey;
  const showActivityDropDown = selectedType === activityTypeKey;
  const eventTypes: IDropdownOption[] = getEventOptions();
  const activityTypes: IDropdownOption[] = getActivityOptions();
  const triggerTypeOptions: IDropdownOption[] = getTriggerOptions(recognizer$kind);

  const onClickSubmitButton = (e) => {
    e.preventDefault();

    const errors = validateForm(selectedType, formData, isRegEx, regexIntents);
    if (hasError(errors)) {
      setFormData({ ...formData, errors });
      return;
    }
    onDismiss();
    onSubmit(dialogId, formData);
  };

  const onSelectTriggerType = (e, option) => {
    setSelectedType(option.key || '');
    const compoundTypes = [activityTypeKey, eventTypeKey];
    const isCompound = compoundTypes.some((t) => option.key === t);
    let newFormData: TriggerFormData = initialFormData;
    if (isCompound) {
      newFormData = { ...newFormData, $kind: '' };
    } else {
      newFormData = { ...newFormData, $kind: option.key === customEventKey ? SDKKinds.OnDialogEvent : option.key };
    }
    setFormData({ ...newFormData, errors: {} });
  };

  const handleEventTypeChange = (e: React.FormEvent, option?: IDropdownOption) => {
    if (option) {
      const errors: TriggerFormDataErrors = {};
      errors.event = validateEventKind(selectedType, option.key as string);
      setFormData({ ...formData, $kind: option.key as string, errors: { ...formData.errors, ...errors } });
    }
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
        <Stack>
          <Dropdown
            data-testid={'triggerTypeDropDown'}
            defaultSelectedKey={selectedType}
            errorMessage={formData.errors.$kind}
            label={formatMessage('What is the type of this trigger?')}
            options={triggerTypeOptions}
            styles={dropdownStyles}
            onChange={onSelectTriggerType}
            onRenderOption={renderDropdownOption}
          />
          {showEventDropDown && (
            <Dropdown
              data-testid={'eventTypeDropDown'}
              errorMessage={formData.errors.event}
              label={formatMessage('Which event?')}
              options={eventTypes}
              placeholder={formatMessage('Select an event type')}
              styles={dropdownStyles}
              onChange={handleEventTypeChange}
            />
          )}
          {showActivityDropDown && (
            <Dropdown
              data-testid={'activityTypeDropDown'}
              errorMessage={formData.errors.activity}
              label={formatMessage('Which activity type?')}
              options={activityTypes}
              placeholder={formatMessage('Select an activity type')}
              styles={dropdownStyles}
              onChange={handleEventTypeChange}
            />
          )}
          {triggerWidget}
        </Stack>
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
