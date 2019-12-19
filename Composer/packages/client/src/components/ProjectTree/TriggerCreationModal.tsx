// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import React, { useState, useContext } from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DialogInfo } from '@bfc/indexers';
import get from 'lodash/get';

import {
  addNewTrigger,
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
} from '../../utils/dialogUtil';
import { StoreContext } from '../../store';

import { styles, dropdownStyles, dialogWindow, intent, triggerPhrases } from './styles';

const nameRegex = /^[a-zA-Z0-9-_.]+$/;
const validateForm = (data: TriggerFormData): TriggerFormDataErrors => {
  const errors: TriggerFormDataErrors = {};
  const { $type, specifiedType, intent, triggerPhrases } = data;

  if ($type === eventTypeKey && !specifiedType) {
    errors.specifiedType = formatMessage('Please select a event type');
  }

  if ($type === activityTypeKey && !specifiedType) {
    errors.specifiedType = formatMessage('Please select an activity type');
  }

  if (!$type) {
    errors.$type = formatMessage('Please select a trigger type');
  }

  if (!intent || !nameRegex.test(intent)) {
    errors.intent = formatMessage(
      'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
    );
  }

  if (!triggerPhrases) {
    errors.triggerPhrases = formatMessage('Please input trigger phrases');
  }
  return errors;
};

interface LuFilePayload {
  id: string;
  content: string;
}

interface TriggerCreationModalProps {
  dialogId: string;
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (dialog: DialogInfo, luFilePayload: LuFilePayload) => void;
}

const initialFormData: TriggerFormData = {
  errors: {},
  $type: intentTypeKey,
  specifiedType: '',
  intent: '',
  triggerPhrases: '',
};

const triggerTypeOptions: IDropdownOption[] = getTriggerTypes();

export const TriggerCreationModal: React.FC<TriggerCreationModalProps> = props => {
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  const [formData, setFormData] = useState(initialFormData);
  const { state } = useContext(StoreContext);
  const { dialogs, luFiles } = state;
  const luFile = luFiles.find(lu => lu.id === dialogId);
  // const dialogFile = dialogs.find(dialog => dialog.id === dialogId);
  const onClickSubmitButton = e => {
    e.preventDefault();
    const errors = validateForm(formData);

    if (Object.keys(errors).length) {
      setFormData({
        ...formData,
        errors,
      });
      return;
    }
    const newContent = get(luFile, 'content', '') + '\n\n' + '# ' + formData.intent + '\n' + formData.triggerPhrases;

    const updateLuFile = {
      id: dialogId,
      content: newContent,
    };

    const newDialog = addNewTrigger(dialogs, dialogId, formData);
    onSubmit(newDialog, updateLuFile);
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

  const onTriggerPhrasesChange = (e, triggerPhrases) => {
    setFormData({ ...formData, triggerPhrases: triggerPhrases });
  };

  const eventTypes: IDropdownOption[] = getEventTypes();
  const activityTypes: IDropdownOption[] = getActivityTypes();
  const messageTypes: IDropdownOption[] = getMessageTypes();

  const showIntentFields = formData.$type === intentTypeKey;
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
            defaultSelectedKey={intentTypeKey}
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
          {showIntentFields && (
            <TextField
              label={formatMessage('What is the name of this trigger')}
              styles={intent}
              onChange={onNameChange}
              errorMessage={formData.errors.intent}
              data-testid="TriggerName"
            />
          )}
          {showIntentFields && (
            <TextField
              label={formatMessage('Trigger phrases')}
              styles={triggerPhrases}
              onChange={onTriggerPhrasesChange}
              data-testid="TriggerPhrases"
              errorMessage={formData.errors.triggerPhrases}
              multiline
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
