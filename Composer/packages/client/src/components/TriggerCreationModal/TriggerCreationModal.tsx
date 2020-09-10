// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState } from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PlaceHolderSectionName } from '@bfc/indexers/lib/utils/luUtil';
import { SDKKinds } from '@bfc/shared';
import { LuEditor, inlineModePlaceholder } from '@bfc/code-editor';
import { useRecoilValue } from 'recoil';

import { TriggerFormData, TriggerFormDataErrors } from '../../utils/dialogUtil';
import { projectIdState } from '../../recoilModel/atoms/botState';
import { userSettingsState } from '../../recoilModel';
import { validatedDialogsSelector } from '../../recoilModel/selectors/validatedDialogs';
import { isRegExRecognizerType, isLUISnQnARecognizerType } from '../../utils/dialogValidator';

import {
  eventTypeKey,
  customEventKey,
  intentTypeKey,
  activityTypeKey,
  qnaMatcherKey,
  onChooseIntentKey,
} from './constants';
import {
  optionStyles,
  dialogContentStyles,
  modalStyles,
  dialogWindowStyles,
  dropdownStyles,
  intentStyles,
  warningIconStyles,
} from './styles';
import {
  validateForm,
  validateEventName,
  validateEventKind,
  validateIntentName,
  getLuDiagnostics,
  validateRegExPattern,
} from './validators';
import { getEventOptions, getActivityOptions, getTriggerOptions } from './getDropdownOptions';

interface TriggerCreationModalProps {
  dialogId: string;
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (dialogId: string, formData: TriggerFormData) => void;
}

export const TriggerCreationModal: React.FC<TriggerCreationModalProps> = (props) => {
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  const dialogs = useRecoilValue(validatedDialogsSelector);

  const projectId = useRecoilValue(projectIdState);
  const userSettings = useRecoilValue(userSettingsState);
  const dialogFile = dialogs.find((dialog) => dialog.id === dialogId);
  const isRegEx = isRegExRecognizerType(dialogFile);
  const isLUISnQnA = isLUISnQnARecognizerType(dialogFile);
  const regexIntents = dialogFile?.content?.recognizer?.intents ?? [];
  const initialFormData: TriggerFormData = {
    errors: {},
    $kind: intentTypeKey,
    event: '',
    intent: '',
    triggerPhrases: '',
    regEx: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [selectedType, setSelectedType] = useState<string>(intentTypeKey);
  const showIntentName = selectedType === intentTypeKey;
  const showRegExDropDown = selectedType === intentTypeKey && isRegEx;
  const showTriggerPhrase = selectedType === intentTypeKey && isLUISnQnA;
  const showEventDropDown = selectedType === eventTypeKey;
  const showActivityDropDown = selectedType === activityTypeKey;
  const showCustomEvent = selectedType === customEventKey;
  const eventTypes: IDropdownOption[] = getEventOptions();
  const activityTypes: IDropdownOption[] = getActivityOptions();
  const triggerTypeOptions: IDropdownOption[] = getTriggerOptions();

  if (isRegEx) {
    const qnaMatcherOption = triggerTypeOptions.find((t) => t.key === qnaMatcherKey);
    if (qnaMatcherOption) {
      qnaMatcherOption.data = { icon: 'Warning' };
    }
    const onChooseIntentOption = triggerTypeOptions.find((t) => t.key === onChooseIntentKey);
    if (onChooseIntentOption) {
      onChooseIntentOption.data = { icon: 'Warning' };
    }
  }

  const onRenderOption = (option?: IDropdownOption) => {
    if (!option) return null;
    return (
      <div css={optionStyles}>
        {option.text}
        {option.data && option.data.icon && <Icon iconName={option.data.icon} style={warningIconStyles} />}
      </div>
    );
  };

  const shouldDisable = (errors: TriggerFormDataErrors) => {
    for (const key in errors) {
      if (errors[key]) {
        return true;
      }
    }
    return false;
  };

  const onClickSubmitButton = (e) => {
    e.preventDefault();

    //If still have some errors here, it is a bug.
    const errors = validateForm(selectedType, formData, isRegEx, regexIntents);
    if (shouldDisable(errors)) {
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

  const handleEventNameChange = (event: React.FormEvent, value?: string) => {
    const errors: TriggerFormDataErrors = {};
    errors.event = validateEventName(selectedType, SDKKinds.OnDialogEvent, value || '');
    setFormData({
      ...formData,
      $kind: SDKKinds.OnDialogEvent,
      event: value || '',
      errors: { ...formData.errors, ...errors },
    });
  };

  const handleEventTypeChange = (e: React.FormEvent, option?: IDropdownOption) => {
    if (option) {
      const errors: TriggerFormDataErrors = {};
      errors.event = validateEventKind(selectedType, option.key as string);
      setFormData({ ...formData, $kind: option.key as string, errors: { ...formData.errors, ...errors } });
    }
  };

  const onNameChange = (e, name) => {
    const errors: TriggerFormDataErrors = {};
    errors.intent = validateIntentName(selectedType, name);
    if (showTriggerPhrase && formData.triggerPhrases) {
      errors.triggerPhrases = getLuDiagnostics(name, formData.triggerPhrases);
    }
    setFormData({ ...formData, intent: name, errors: { ...formData.errors, ...errors } });
  };

  const onChangeRegEx = (e, pattern) => {
    const errors: TriggerFormDataErrors = {};
    errors.regEx = validateRegExPattern(selectedType, isRegEx, pattern);
    setFormData({ ...formData, regEx: pattern, errors: { ...formData.errors, ...errors } });
  };

  //Trigger phrase is optional
  const onTriggerPhrasesChange = (body: string) => {
    const errors: TriggerFormDataErrors = {};
    if (body) {
      errors.triggerPhrases = getLuDiagnostics(formData.intent, body);
    } else {
      errors.triggerPhrases = '';
    }
    setFormData({ ...formData, triggerPhrases: body, errors: { ...formData.errors, ...errors } });
  };
  const errors = validateForm(selectedType, formData, isRegEx, regexIntents);
  const disable = shouldDisable(errors);

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
            onRenderOption={onRenderOption}
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
          {showCustomEvent && (
            <TextField
              required
              data-testid="CustomEventName"
              errorMessage={formData.errors.event}
              label={formatMessage('What is the name of the custom event?')}
              styles={intentStyles}
              onChange={handleEventNameChange}
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
          {showIntentName && (
            <TextField
              data-testid="TriggerName"
              errorMessage={formData.errors.intent}
              label={
                isRegEx
                  ? formatMessage('What is the name of this trigger (RegEx)')
                  : isLUISnQnA
                  ? formatMessage('What is the name of this trigger (LUIS)')
                  : formatMessage('What is the name of this trigger')
              }
              styles={intentStyles}
              onChange={onNameChange}
            />
          )}

          {showRegExDropDown && (
            <TextField
              data-testid="RegExField"
              errorMessage={formData.errors.regEx}
              label={formatMessage('Please input regEx pattern')}
              onChange={onChangeRegEx}
            />
          )}
          {showTriggerPhrase && (
            <React.Fragment>
              <Label>{formatMessage('Trigger phrases')}</Label>
              <LuEditor
                editorSettings={userSettings.codeEditor}
                errorMessage={formData.errors.triggerPhrases}
                height={225}
                luOption={{
                  projectId,
                  fileId: dialogId,
                  sectionId: PlaceHolderSectionName,
                }}
                placeholder={inlineModePlaceholder}
                value={formData.triggerPhrases}
                onChange={onTriggerPhrasesChange}
              />
            </React.Fragment>
          )}
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
