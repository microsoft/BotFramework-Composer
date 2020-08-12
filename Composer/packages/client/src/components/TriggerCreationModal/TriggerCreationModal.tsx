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
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { PlaceHolderSectionName } from '@bfc/indexers/lib/utils/luUtil';
import { DialogInfo, SDKKinds, LuIntentSection } from '@bfc/shared';
import { LuEditor, inlineModePlaceholder } from '@bfc/code-editor';
import { useRecoilValue } from 'recoil';

import { generateNewDialog } from '../../utils/dialogUtil';
import { projectIdState, schemasState } from '../../recoilModel/atoms/botState';
import { userSettingsState } from '../../recoilModel';
import { validatedDialogsSelector } from '../../recoilModel/selectors/validatedDialogs';

import { TriggerFormData } from './types/TriggerFormData';
import { TriggerFormDataErrors } from './types/TriggerFormDataErrors';
import { customEventKey, EventTypes, ActivityTypes } from './constants';
import { getTriggerTypes } from './getTriggerTypes';
import { modalStyles, dialogStyles, triggerFormStyles, dropdownStyles, textInputStyles } from './style';
import {
  getLuDiagnostics,
  validateEventName,
  validateEventKind,
  validateForm,
  validateIntentName,
  validateRegExPattern,
  validateActivityKind,
  validateTriggerKind,
} from './validators';

const shouldDisable = (errors: TriggerFormDataErrors) => {
  for (const key in errors) {
    if (errors[key]) {
      return true;
    }
  }
  return false;
};

interface TriggerCreationModalProps {
  dialogId: string;
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (dialog: DialogInfo, intent?: LuIntentSection) => void;
}

export const TriggerCreationModal: React.FC<TriggerCreationModalProps> = (props) => {
  const { isOpen, onDismiss, onSubmit, dialogId } = props;

  const dialogs = useRecoilValue(validatedDialogsSelector);
  const projectId = useRecoilValue(projectIdState);
  const schemas = useRecoilValue(schemasState);
  const userSettings = useRecoilValue(userSettingsState);

  const dialogFile = dialogs.find((dialog) => dialog.id === dialogId);
  const recognizer = dialogFile?.content?.recognizer;
  const regexIntents = recognizer?.intents ?? [];
  const [selectedType, setSelectedType] = useState(recognizer ? SDKKinds.OnIntent : '');
  const initialFormData: TriggerFormData = {
    errors: {},
    $kind: recognizer ? SDKKinds.OnIntent : '',
    event: '',
    intent: '',
    triggerPhrases: '',
    regEx: '',
  };
  const [formData, setFormData] = useState(initialFormData);

  const showEventDropDown = selectedType === SDKKinds.OnDialogEvent;
  const showActivityDropDown = selectedType === SDKKinds.OnActivity;

  const isCustomEvent = selectedType === customEventKey;
  const isOnIntent = selectedType === SDKKinds.OnIntent;
  const isRegexRecognizer = recognizer?.$kind === SDKKinds.RegexRecognizer;
  const isLuisRecognizer = !isRegexRecognizer;

  const onClickSubmitButton = (e) => {
    e.preventDefault();

    //If still have some errors here, it is a bug.
    const errors = validateForm(selectedType, formData, isRegexRecognizer, regexIntents);
    if (shouldDisable(errors)) {
      setFormData({
        ...formData,
        errors,
      });
      return;
    }
    const newDialog = generateNewDialog(dialogs, dialogId, formData, schemas.sdk?.content);
    if (formData.$kind === SDKKinds.OnIntent && !isRegexRecognizer) {
      const newIntent = { Name: formData.intent, Body: formData.triggerPhrases };
      onSubmit(newDialog, newIntent);
    } else {
      onSubmit(newDialog);
    }
    onDismiss();
  };

  const onSelectTriggerType = (e, option) => {
    setSelectedType(option.key || '');
    const compoundTypes = [SDKKinds.OnActivity, SDKKinds.OnDialogEvent];
    const isCompound = compoundTypes.some((t) => option.key === t);
    let newFormData: TriggerFormData = initialFormData;
    if (isCompound) {
      newFormData = { ...newFormData, $kind: '' };
    } else {
      newFormData = { ...newFormData, $kind: option.key === customEventKey ? SDKKinds.OnDialogEvent : option.key };
    }
    newFormData.errors.$kind = validateTriggerKind(option.key);
    setFormData(newFormData);
  };

  const handleEventNameChange = (event: React.FormEvent, value?: string) => {
    const errors: TriggerFormDataErrors = {};
    errors.customEventName = validateEventName(selectedType, SDKKinds.OnDialogEvent, value || '');
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

  const handleActivityTypeChange = (e: React.FormEvent, option?: IDropdownOption) => {
    if (option) {
      const errors: TriggerFormDataErrors = {};
      errors.activity = validateActivityKind(selectedType, option.key as string);
      setFormData({ ...formData, $kind: option.key as string, errors: { ...formData.errors, ...errors } });
    }
  };

  const onIntentNameChange = (e, name) => {
    const errors: TriggerFormDataErrors = {};
    errors.intent = validateIntentName(selectedType, name);
    if (isLuisRecognizer) {
      errors.triggerPhrases = getLuDiagnostics(name, formData.triggerPhrases);
    }
    setFormData({ ...formData, intent: name, errors: { ...formData.errors, ...errors } });
  };

  const onChangeRegEx = (e, pattern) => {
    const errors: TriggerFormDataErrors = {};
    errors.regEx = validateRegExPattern(selectedType, isRegexRecognizer, pattern);
    setFormData({ ...formData, regEx: pattern, errors: { ...formData.errors, ...errors } });
  };

  const onTriggerPhrasesChange = (body: string) => {
    const errors: TriggerFormDataErrors = {};
    errors.triggerPhrases = getLuDiagnostics(formData.intent, body);
    setFormData({ ...formData, triggerPhrases: body, errors: { ...formData.errors, ...errors } });
  };
  const errors = validateForm(selectedType, formData, isRegexRecognizer, regexIntents);
  const preventSubmit = shouldDisable(errors);

  const customEventWidget = (
    <TextField
      data-testid="CustomEventName"
      errorMessage={formData.errors.customEventName}
      label={formatMessage('What is the name of the custom event?')}
      styles={textInputStyles}
      onChange={handleEventNameChange}
    />
  );

  const onIntentWidget = (
    <React.Fragment>
      <TextField
        data-testid="TriggerName"
        errorMessage={formData.errors.intent}
        label={
          isRegexRecognizer
            ? formatMessage('What is the name of this trigger (RegEx)')
            : formatMessage('What is the name of this trigger (LUIS)')
        }
        styles={textInputStyles}
        onChange={onIntentNameChange}
      />
      {isRegexRecognizer && (
        <TextField
          data-testid="RegExField"
          errorMessage={formData.errors.regEx}
          label={formatMessage('Please input regEx pattern')}
          styles={textInputStyles}
          onChange={onChangeRegEx}
        />
      )}
      {isLuisRecognizer && (
        <React.Fragment>
          <Label>{formatMessage('Trigger phrases')}</Label>
          <LuEditor
            editorSettings={userSettings.codeEditor}
            errorMessage={formData.errors.triggerPhrases}
            height={225}
            luOption={{
              projectId,
              fileId: dialogId,
              sectionId: formData.intent || PlaceHolderSectionName,
            }}
            placeholder={inlineModePlaceholder}
            value={formData.triggerPhrases}
            onChange={onTriggerPhrasesChange}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Create a trigger'),
        styles: dialogStyles,
      }}
      hidden={!isOpen}
      modalProps={{
        isBlocking: false,
        styles: modalStyles,
      }}
      onDismiss={onDismiss}
    >
      <div css={triggerFormStyles}>
        <Stack>
          <Dropdown
            data-testid={'triggerTypeDropDown'}
            defaultSelectedKey={selectedType}
            errorMessage={formData.errors.$kind}
            label={formatMessage('What is the type of this trigger?')}
            options={getTriggerTypes(recognizer)}
            styles={dropdownStyles}
            onChange={onSelectTriggerType}
          />
          {showEventDropDown && (
            <Dropdown
              data-testid={'eventTypeDropDown'}
              errorMessage={formData.errors.event}
              label={formatMessage('Which event?')}
              options={EventTypes}
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
              options={ActivityTypes}
              placeholder={formatMessage('Select an activity type')}
              styles={dropdownStyles}
              onChange={handleActivityTypeChange}
            />
          )}
          {isCustomEvent && customEventWidget}
          {isOnIntent && onIntentWidget}
        </Stack>
      </div>
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        <PrimaryButton
          data-testid={'triggerFormSubmit'}
          disabled={preventSubmit}
          text={formatMessage('Submit')}
          onClick={onClickSubmitButton}
        />
      </DialogFooter>
    </Dialog>
  );
};
