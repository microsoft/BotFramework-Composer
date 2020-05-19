// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useContext, useEffect } from 'react';
import formatMessage, { select } from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { luIndexer, combineMessage } from '@bfc/indexers';
import { PlaceHolderSectionName } from '@bfc/indexers/lib/utils/luUtil';
import get from 'lodash/get';
import { DialogInfo, SDKKinds } from '@bfc/shared';
import { LuEditor, inlineModePlaceholder } from '@bfc/code-editor';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/ComboBox';

import {
  generateNewDialog,
  getTriggerTypes,
  TriggerFormData,
  TriggerFormDataErrors,
  eventTypeKey,
  customEventKey,
  intentTypeKey,
  activityTypeKey,
  getEventTypes,
  getActivityTypes,
  regexRecognizerKey,
} from '../../utils/dialogUtil';
import { addIntent } from '../../utils/luUtil';
import { StoreContext } from '../../store';

import { styles, dropdownStyles, dialogWindow, intent, triggerPhrases } from './styles';

const nameRegex = /^[a-zA-Z0-9-_.]+$/;
const initialFormDataErrors = {
  $kind: '',
  intent: '',
  event: '',
  triggerPhrases: '',
  regEx: '',
  activity: '',
};

const getLuDiagnostics = (intent: string, triggerPhrases: string) => {
  const content = '#' + intent + '\n' + triggerPhrases;
  const { diagnostics } = luIndexer.parse(content);
  return combineMessage(diagnostics);
};

const validateIntentName = (selectedType: string, intent: string): string => {
  if (selectedType === intentTypeKey && (!intent || !nameRegex.test(intent))) {
    return formatMessage(
      'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
    );
  }
  return '';
};

const validateDupRegExIntent = (
  selectedType: string,
  intent: string,
  isRegEx: boolean,
  regExIntents: [{ intent: string; pattern: string }]
): string => {
  if (selectedType === intentTypeKey && isRegEx && regExIntents.find((ri) => ri.intent === intent)) {
    return `regEx ${intent} is already defined`;
  }
  return '';
};

const validateRegExPattern = (selectedType: string, isRegEx: boolean, regEx: string): string => {
  if (selectedType === intentTypeKey && isRegEx && !regEx) {
    return formatMessage('Please input regEx pattern');
  }
  return '';
};

const validateEventName = (selectedType: string, $kind: string, eventName: string): string => {
  if (selectedType === customEventKey && $kind === eventTypeKey && !eventName) {
    return formatMessage('Please enter an event name');
  }
  return '';
};

const validateEventKind = (selectedType: string, $kind: string): string => {
  if (selectedType === eventTypeKey && !$kind) {
    return formatMessage('Please select a event type');
  }

  if (selectedType === activityTypeKey && !$kind) {
    return formatMessage('Please select an activity type');
  }
  return '';
};

const validateTriggerKind = (selectedType: string): string => {
  if (!selectedType) {
    return formatMessage('Please select a trigger type');
  }
  return '';
};

const validateTriggerPhrases = (selectedType: string, isRegEx: boolean, intent: string, triggerPhrases: string) => {
  if (selectedType === intentTypeKey && !isRegEx) {
    if (triggerPhrases) {
      return getLuDiagnostics(intent, triggerPhrases);
    } else {
      return formatMessage('Please input trigger phrases');
    }
  }
  return '';
};

const validateForm = (
  selectedType: string,
  data: TriggerFormData,
  isRegEx: boolean,
  regExIntents: [{ intent: string; pattern: string }]
): TriggerFormDataErrors => {
  const errors: TriggerFormDataErrors = {};
  const { $kind, event: eventName, intent, regEx, triggerPhrases } = data;

  errors.event = validateEventName(selectedType, $kind, eventName);
  errors.event = validateEventKind(selectedType, $kind);
  errors.$kind = validateTriggerKind(selectedType);
  errors.intent = validateIntentName(selectedType, intent);
  errors.regEx = validateDupRegExIntent(selectedType, intent, isRegEx, regExIntents);
  errors.regEx = validateRegExPattern(selectedType, isRegEx, regEx);
  errors.triggerPhrases = validateTriggerPhrases(selectedType, isRegEx, intent, triggerPhrases);
  // if (selectedType === intentTypeKey && !isRegEx && !triggerPhrases) {
  //   errors.triggerPhrases = formatMessage('Please input trigger phrases');
  // }

  // //errors from lu parser
  // if (data.errors.triggerPhrases && selectedType === intentTypeKey && !isRegEx) {
  //   errors.triggerPhrases = data.errors.triggerPhrases;
  // }
  return errors;
};

export interface LuFilePayload {
  id: string;
  content: string;
}

interface TriggerCreationModalProps {
  dialogId: string;
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (dialog: DialogInfo, luFilePayload?: LuFilePayload) => void;
}

export const TriggerCreationModal: React.FC<TriggerCreationModalProps> = (props) => {
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  const { state } = useContext(StoreContext);
  const { dialogs, luFiles, locale, projectId, schemas } = state;
  const luFile = luFiles.find(({ id }) => id === `${dialogId}.${locale}`);
  const dialogFile = dialogs.find((dialog) => dialog.id === dialogId);
  const isRegEx = get(dialogFile, 'content.recognizer.$kind', '') === regexRecognizerKey;
  const regexIntents = get(dialogFile, 'content.recognizer.intents', []);
  const isNone = !get(dialogFile, 'content.recognizer');
  const initialFormData: TriggerFormData = {
    errors: initialFormDataErrors,
    $kind: isNone ? '' : intentTypeKey,
    event: '',
    intent: '',
    triggerPhrases: '',
    regEx: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  //const [disable, setDisable] = useState(true);
  const [selectedType, setSelectedType] = useState(isNone ? '' : intentTypeKey);
  const showIntentName = selectedType === intentTypeKey;
  const showRegExDropDown = selectedType === intentTypeKey && isRegEx;
  const showTriggerPhrase = selectedType === intentTypeKey && !isRegEx;
  const showEventDropDown = selectedType === eventTypeKey;
  const showActivityDropDown = selectedType === activityTypeKey;
  const showCustomEvent = selectedType === customEventKey;

  const eventTypes: IComboBoxOption[] = getEventTypes();
  const activityTypes: IDropdownOption[] = getActivityTypes();
  let triggerTypeOptions: IDropdownOption[] = getTriggerTypes();

  if (isNone) {
    triggerTypeOptions = triggerTypeOptions.filter((t) => t.key !== intentTypeKey);
  }

  const shouldDisable = (errors: TriggerFormDataErrors) => {
    for (const key in errors) {
      if (errors[key]) {
        console.log(key);
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
      setFormData({
        ...formData,
        errors,
      });
      return;
    }

    const content = get(luFile, 'content', '');
    const luFileId = luFile?.id || `${dialogId}.${locale}`;
    const newDialog = generateNewDialog(dialogs, dialogId, formData, schemas.sdk?.content);
    if (formData.$kind === intentTypeKey && !isRegEx) {
      const newContent = addIntent(content, { Name: formData.intent, Body: formData.triggerPhrases });
      const updateLuFile = {
        id: luFileId,
        content: newContent,
      };
      onSubmit(newDialog, updateLuFile);
    } else {
      onSubmit(newDialog);
    }
    onDismiss();
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
    setFormData({ ...newFormData, errors: initialFormDataErrors });
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
    if (showTriggerPhrase) {
      errors.triggerPhrases = getLuDiagnostics(name, formData.triggerPhrases);
    }
    setFormData({ ...formData, intent: name, errors: { ...formData.errors, ...errors } });
  };

  const onChangeRegEx = (e, pattern) => {
    const errors: TriggerFormDataErrors = {};
    errors.regEx = validateRegExPattern(selectedType, isRegEx, pattern);
    setFormData({ ...formData, regEx: pattern, errors: { ...formData.errors, ...errors } });
  };

  const onTriggerPhrasesChange = (body: string) => {
    const errors: TriggerFormDataErrors = {};
    errors.triggerPhrases = getLuDiagnostics(formData.intent, body);
    setFormData({ ...formData, triggerPhrases: body, errors: { ...formData.errors, ...errors } });
  };
  console.log(formData);
  const errors = validateForm(selectedType, formData, isRegEx, regexIntents);
  console.log(errors);
  const disable = shouldDisable(errors);

  return (
    <Dialog
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Create a trigger'),
        styles: styles.dialog,
      }}
      hidden={!isOpen}
      modalProps={{
        isBlocking: false,
        styles: styles.modal,
      }}
      onDismiss={onDismiss}
    >
      <div css={dialogWindow}>
        <Stack>
          <Dropdown
            data-testid={'triggerTypeDropDown'}
            defaultSelectedKey={selectedType}
            errorMessage={formData.errors.$kind}
            label={formatMessage('What is the type of this trigger?')}
            options={triggerTypeOptions}
            styles={dropdownStyles}
            onChange={onSelectTriggerType}
          />
          {showEventDropDown && (
            <Dropdown
              data-testid={'eventTypeDropDown'}
              errorMessage={formData.errors.event}
              label={formatMessage('Which event?')}
              options={eventTypes}
              placeholder={formatMessage('Select a event type')}
              styles={dropdownStyles}
              onChange={handleEventTypeChange}
            />
          )}
          {showCustomEvent && (
            <TextField
              data-testid="CustomEventName"
              errorMessage={formData.errors.event}
              label={formatMessage('What is the name of the custom event?')}
              styles={intent}
              onChange={handleEventNameChange}
            />
          )}
          {showActivityDropDown && (
            <Dropdown
              data-testid={'activityTypeDropDown'}
              errorMessage={formData.errors.activity}
              label={formatMessage('Which activity type')}
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
                  : formatMessage('What is the name of this trigger (Luis)')
              }
              styles={intent}
              onChange={onNameChange}
            />
          )}

          {showRegExDropDown && (
            <TextField
              data-testid="RegExField"
              errorMessage={formData.errors.regEx}
              label={formatMessage('Please input regex pattern')}
              onChange={onChangeRegEx}
            />
          )}
          {showTriggerPhrase && (
            <React.Fragment>
              <Label>{formatMessage('Trigger phrases')}</Label>
              <LuEditor
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
        </Stack>
      </div>
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
        <PrimaryButton
          data-testid={'triggerFormSubmit'}
          disabled={Object.keys(formData.errors).length > 0}
          text={formatMessage('Submit')}
          onClick={onClickSubmitButton}
        />
      </DialogFooter>
    </Dialog>
  );
};

export default TriggerCreationModal;
