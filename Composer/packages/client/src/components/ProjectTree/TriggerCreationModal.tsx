// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useContext } from 'react';
import formatMessage from 'format-message';
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

import { styles, dropdownStyles, dialogWindow, intent } from './styles';

const nameRegex = /^[a-zA-Z0-9-_.]+$/;
const validateForm = (
  selectedType: string,
  data: TriggerFormData,
  isRegEx: boolean,
  regExIntents: [{ intent: string; pattern: string }]
): TriggerFormDataErrors => {
  const errors: TriggerFormDataErrors = {};
  const { $kind, event: eventName, intent, triggerPhrases, regexEx } = data;

  if (selectedType === customEventKey && $kind === eventTypeKey && !eventName) {
    errors.event = formatMessage('Please enter an event name');
  }

  if (selectedType === eventTypeKey && !$kind) {
    errors.event = formatMessage('Please select a event type');
  }

  if (selectedType === activityTypeKey && !$kind) {
    errors.activity = formatMessage('Please select an activity type');
  }

  if (!selectedType) {
    errors.$kind = formatMessage('Please select a trigger type');
  }

  if (selectedType === intentTypeKey && (!intent || !nameRegex.test(intent))) {
    errors.intent = formatMessage(
      'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
    );
  }

  if (selectedType === intentTypeKey && isRegEx && regExIntents.find((ri) => ri.intent === intent)) {
    errors.intent = `regEx ${intent} is already defined`;
  }

  if (selectedType === intentTypeKey && isRegEx && !regexEx) {
    errors.regexEx = formatMessage('Please input regEx pattern');
  }

  if (selectedType === intentTypeKey && !isRegEx && !triggerPhrases) {
    errors.triggerPhrases = formatMessage('Please input trigger phrases');
  }

  //errors from lu parser
  if (data.errors.triggerPhrases && selectedType === intentTypeKey && !isRegEx) {
    errors.triggerPhrases = data.errors.triggerPhrases;
  }
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
    errors: {},
    $kind: isNone ? '' : intentTypeKey,
    event: '',
    intent: '',
    triggerPhrases: '',
    regexEx: '',
  };
  const [formData, setFormData] = useState(initialFormData);
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

  const onClickSubmitButton = (e) => {
    e.preventDefault();
    const errors = validateForm(selectedType, formData, isRegEx, regexIntents);

    if (Object.keys(errors).length) {
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

    if (isCompound) {
      setFormData({ ...initialFormData, $kind: '' });
    } else {
      setFormData({ ...initialFormData, $kind: option.key === customEventKey ? SDKKinds.OnDialogEvent : option.key });
    }
  };

  const handleEventNameChange = (event: React.FormEvent, value?: string) => {
    setFormData({ ...formData, $kind: SDKKinds.OnDialogEvent, event: value || '' });
  };

  const handleEventTypeChange = (e: React.FormEvent, option?: IDropdownOption) => {
    if (option) {
      setFormData({ ...formData, $kind: option.key as string });
    }
  };

  const getLuDiagnostics = (intent: string, triggerPhrases: string) => {
    const content = '#' + intent + '\n' + triggerPhrases;
    const { diagnostics } = luIndexer.parse(content);
    return combineMessage(diagnostics);
  };

  const onNameChange = (e, name) => {
    const errors = formData.errors;
    if (showTriggerPhrase) {
      errors.triggerPhrases = getLuDiagnostics(name, formData.triggerPhrases);
    }
    setFormData({ ...formData, intent: name, errors });
  };

  const onChangeRegEx = (e, pattern) => {
    setFormData({ ...formData, regexEx: pattern });
  };

  const onTriggerPhrasesChange = (body: string) => {
    const errors = formData.errors;
    errors.triggerPhrases = getLuDiagnostics(formData.intent, body);
    setFormData({ ...formData, triggerPhrases: body, errors });
  };

  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: formatMessage('Create a trigger'),
        styles: styles.dialog,
      }}
      modalProps={{
        isBlocking: false,
        styles: styles.modal,
      }}
    >
      <div css={dialogWindow}>
        <Stack>
          <Dropdown
            label={formatMessage('What is the type of this trigger?')}
            options={triggerTypeOptions}
            styles={dropdownStyles}
            onChange={onSelectTriggerType}
            errorMessage={formData.errors.$kind}
            data-testid={'triggerTypeDropDown'}
            defaultSelectedKey={selectedType}
          />
          {showEventDropDown && (
            <Dropdown
              placeholder={formatMessage('Select a event type')}
              label={formatMessage('Which event?')}
              options={eventTypes}
              styles={dropdownStyles}
              onChange={handleEventTypeChange}
              errorMessage={formData.errors.event}
              data-testid={'eventTypeDropDown'}
            />
          )}
          {showCustomEvent && (
            <TextField
              label={formatMessage('What is the name of the custom event?')}
              styles={intent}
              onChange={handleEventNameChange}
              errorMessage={formData.errors.event}
              data-testid="CustomEventName"
            />
          )}
          {showActivityDropDown && (
            <Dropdown
              placeholder={formatMessage('Select an activity type')}
              label={formatMessage('Which activity type')}
              options={activityTypes}
              styles={dropdownStyles}
              onChange={handleEventTypeChange}
              errorMessage={formData.errors.activity}
              data-testid={'activityTypeDropDown'}
            />
          )}
          {showIntentName && (
            <TextField
              label={
                isRegEx
                  ? formatMessage('What is the name of this trigger (RegEx)')
                  : formatMessage('What is the name of this trigger (Luis)')
              }
              styles={intent}
              onChange={onNameChange}
              errorMessage={formData.errors.intent}
              data-testid="TriggerName"
            />
          )}

          {showRegExDropDown && (
            <TextField
              label={formatMessage('Please input regex pattern')}
              onChange={onChangeRegEx}
              errorMessage={formData.errors.regexEx}
              data-testid="RegExField"
            />
          )}
          {showTriggerPhrase && (
            <React.Fragment>
              <Label>{formatMessage('Trigger phrases')}</Label>
              <LuEditor
                onChange={onTriggerPhrasesChange}
                value={formData.triggerPhrases}
                errorMessage={formData.errors.triggerPhrases}
                luOption={{
                  projectId,
                  fileId: dialogId,
                  sectionId: formData.intent || PlaceHolderSectionName,
                }}
                height={225}
                placeholder={inlineModePlaceholder}
              />
            </React.Fragment>
          )}
        </Stack>
      </div>
      <DialogFooter>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={onClickSubmitButton} text={formatMessage('Submit')} data-testid={'triggerFormSubmit'} />
      </DialogFooter>
    </Dialog>
  );
};

export default TriggerCreationModal;
