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
import get from 'lodash/get';
import { DialogInfo } from '@bfc/shared';
import { LuEditor } from '@bfc/code-editor';

import {
  generateNewDialog,
  getTriggerTypes,
  TriggerFormData,
  TriggerFormDataErrors,
  eventTypeKey,
  intentTypeKey,
  activityTypeKey,
  messageTypeKey,
  getEventTypes,
  getActivityTypes,
  getMessageTypes,
  regexRecognizerKey,
} from '../../utils/dialogUtil';
import { addIntent } from '../../utils/luUtil';
import { StoreContext } from '../../store';

import { styles, dropdownStyles, dialogWindow, intent } from './styles';

const nameRegex = /^[a-zA-Z0-9-_.]+$/;
const validateForm = (
  data: TriggerFormData,
  isRegEx: boolean,
  regExIntents: [{ intent: string; pattern: string }]
): TriggerFormDataErrors => {
  const errors: TriggerFormDataErrors = {};
  const { $type, specifiedType, intent, triggerPhrases, regexEx } = data;

  if ($type === eventTypeKey && !specifiedType) {
    errors.specifiedType = formatMessage('Please select a event type');
  }

  if ($type === activityTypeKey && !specifiedType) {
    errors.specifiedType = formatMessage('Please select an activity type');
  }

  if ($type === messageTypeKey && !specifiedType) {
    errors.specifiedType = formatMessage('Please select a message type');
  }

  if (!$type) {
    errors.$type = formatMessage('Please select a trigger type');
  }

  if ($type === intentTypeKey && (!intent || !nameRegex.test(intent))) {
    errors.intent = formatMessage(
      'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
    );
  }

  if ($type === intentTypeKey && isRegEx && regExIntents.find(ri => ri.intent === intent)) {
    errors.intent = `regEx ${intent} is already defined`;
  }

  if ($type === intentTypeKey && isRegEx && !regexEx) {
    errors.regexEx = formatMessage('Please input regEx pattern');
  }

  if ($type === intentTypeKey && !isRegEx && !triggerPhrases) {
    errors.triggerPhrases = formatMessage('Please input trigger phrases');
  }
  if (data.errors.triggerPhrases) {
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

export const TriggerCreationModal: React.FC<TriggerCreationModalProps> = props => {
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  const { state } = useContext(StoreContext);
  const { dialogs, luFiles, projectId } = state;
  const luFile = luFiles.find(lu => lu.id === dialogId);
  const dialogFile = dialogs.find(dialog => dialog.id === dialogId);
  const isRegEx = get(dialogFile, 'content.recognizer.$type', '') === regexRecognizerKey;
  const regexIntents = get(dialogFile, 'content.recognizer.intents', []);
  const isNone = !get(dialogFile, 'content.recognizer');
  const initialFormData: TriggerFormData = {
    errors: {},
    $type: isNone ? '' : intentTypeKey,
    specifiedType: '',
    intent: '',
    triggerPhrases: '',
    regexEx: '',
  };
  const [formData, setFormData] = useState(initialFormData);

  const onClickSubmitButton = e => {
    e.preventDefault();
    const errors = validateForm(formData, isRegEx, regexIntents);

    if (Object.keys(errors).length) {
      setFormData({
        ...formData,
        errors,
      });
      return;
    }

    const content = get(luFile, 'content', '');
    const newDialog = generateNewDialog(dialogs, dialogId, formData);
    if (formData.$type === intentTypeKey && !isRegEx) {
      const newContent = addIntent(content, { Name: formData.intent, Body: formData.triggerPhrases });
      const updateLuFile = {
        id: dialogId,
        content: newContent,
      };
      onSubmit(newDialog, updateLuFile);
    } else {
      onSubmit(newDialog);
    }
    onDismiss();
  };

  const onSelectTriggerType = (e, option) => {
    setFormData({ ...initialFormData, $type: option.key });
  };

  const onSelectSpecifiedTypeType = (e, option) => {
    setFormData({ ...formData, specifiedType: option.key });
  };

  const onNameChange = (e, name) => {
    setFormData({ ...formData, intent: name });
  };

  const onChangeRegEx = (e, pattern) => {
    setFormData({ ...formData, regexEx: pattern });
  };

  const onTriggerPhrasesChange = (body: string) => {
    const errors = formData.errors;
    const content = '#' + formData.intent + '\n' + body;
    const { diagnostics } = luIndexer.parse(content);
    errors.triggerPhrases = combineMessage(diagnostics);
    setFormData({ ...formData, triggerPhrases: body, errors });
  };

  const eventTypes: IDropdownOption[] = getEventTypes();
  const activityTypes: IDropdownOption[] = getActivityTypes();
  const messageTypes: IDropdownOption[] = getMessageTypes();
  let triggerTypeOptions: IDropdownOption[] = getTriggerTypes();
  if (isNone) {
    triggerTypeOptions = triggerTypeOptions.filter(t => t.key !== intentTypeKey);
  }
  const showIntentName = formData.$type === intentTypeKey;
  const showRegExDropDown = formData.$type === intentTypeKey && isRegEx;
  const showTriggerPhrase = formData.$type === intentTypeKey && !isRegEx;
  const showEventDropDown = formData.$type === eventTypeKey;
  const showActivityDropDown = formData.$type === activityTypeKey;
  const showMessageDropDown = formData.$type === messageTypeKey;

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
            errorMessage={formData.errors.$type}
            data-testid={'triggerTypeDropDown'}
            defaultSelectedKey={formData.$type}
          />
          {showEventDropDown && (
            <Dropdown
              placeholder={formatMessage('Select a event type')}
              label={formatMessage('Which event?')}
              options={eventTypes}
              styles={dropdownStyles}
              onChange={onSelectSpecifiedTypeType}
              errorMessage={formData.errors.specifiedType}
              data-testid={'eventTypeDropDown'}
            />
          )}
          {showActivityDropDown && (
            <Dropdown
              placeholder={formatMessage('Select an activity type')}
              label={formatMessage('Which activity type')}
              options={activityTypes}
              styles={dropdownStyles}
              onChange={onSelectSpecifiedTypeType}
              errorMessage={formData.errors.specifiedType}
              data-testid={'activityTypeDropDown'}
            />
          )}
          {showMessageDropDown && (
            <Dropdown
              placeholder={formatMessage('Select a message type')}
              label={formatMessage('Which message type?')}
              options={messageTypes}
              styles={dropdownStyles}
              onChange={onSelectSpecifiedTypeType}
              errorMessage={formData.errors.specifiedType}
              data-testid={'messageTypeDropDown'}
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
              data-testid={'RegExDropDown'}
            />
          )}
          {showTriggerPhrase && <Label>{formatMessage('Trigger phrases')}</Label>}
          {showTriggerPhrase && (
            <LuEditor
              onChange={onTriggerPhrasesChange}
              value={formData.triggerPhrases}
              errorMessage={formData.errors.triggerPhrases}
              hidePlaceholder={true}
              luOption={{
                projectId,
                fileId: dialogId,
                sectionId: formData.intent || 'newSection',
              }}
              options={{
                lineNumbers: 'off',
                minimap: {
                  enabled: false,
                },
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 0,
                glyphMargin: false,
                folding: false,
                renderLineHighlight: 'none',
              }}
              height={150}
            />
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
