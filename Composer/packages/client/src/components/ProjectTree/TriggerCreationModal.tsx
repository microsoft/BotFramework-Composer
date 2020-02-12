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
import get from 'lodash/get';
import { DialogInfo } from '@bfc/indexers';

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
  regexRecognizerKey,
} from '../../utils/dialogUtil';
import { StoreContext } from '../../store';

import { styles, dropdownStyles, dialogWindow } from './styles';

const validateForm = (data: TriggerFormData): TriggerFormDataErrors => {
  const errors: TriggerFormDataErrors = {};
  const { $type, specifiedType } = data;

  if ($type === eventTypeKey && !specifiedType) {
    errors.specifiedType = formatMessage('Please select a event type');
  }

  if ($type === activityTypeKey && !specifiedType) {
    errors.specifiedType = formatMessage('Please select an activity type');
  }

  if (!$type) {
    errors.$type = formatMessage('Please select a trigger type');
  }
  return errors;
};

interface TriggerCreationModalProps {
  dialogId: string;
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (dialog: DialogInfo) => void;
}

const initialFormData: TriggerFormData = {
  errors: {},
  $type: intentTypeKey,
  intent: '',
  specifiedType: '',
};

const triggerTypeOptions: IDropdownOption[] = getTriggerTypes();

export const TriggerCreationModal: React.FC<TriggerCreationModalProps> = props => {
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  const [formData, setFormData] = useState(initialFormData);
  const { state } = useContext(StoreContext);
  const { dialogs, luFiles } = state;
  const luFile = luFiles.find(lu => lu.id === dialogId);
  const dialogFile = dialogs.find(dialog => dialog.id === dialogId);
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
    const newDialog = addNewTrigger(dialogs, dialogId, formData);
    onSubmit(newDialog);
    onDismiss();
  };

  const onSelectTriggerType = (e, option) => {
    setFormData({ ...initialFormData, $type: option.key });
  };

  const onSelectIntent = (e, option) => {
    setFormData({ ...formData, intent: option.key });
  };

  const onSelectSpecifiedTypeType = (e, option) => {
    setFormData({ ...formData, specifiedType: option.key });
  };

  const eventTypes: IDropdownOption[] = getEventTypes();
  const activityTypes: IDropdownOption[] = getActivityTypes();
  const messageTypes: IDropdownOption[] = getMessageTypes();

  const isRegEx = get(dialogFile, 'content.recognizer.$type', '') === regexRecognizerKey;

  const regexIntents = get(dialogFile, 'content.recognizer.intents', []);
  const luisIntents = get(luFile, 'intents', []);
  const intents = isRegEx ? regexIntents : luisIntents;

  const intentOptions = intents.map(t => {
    return { key: t.name || t.Name || t.intent, text: t.name || t.Name || t.intent };
  });

  const showIntentDropDown = formData.$type === intentTypeKey;
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
          {showIntentDropDown && (
            <Dropdown
              label={formatMessage('Which intent do you want to handle? (Optional)')}
              options={intentOptions}
              styles={dropdownStyles}
              onChange={onSelectIntent}
              disabled={intentOptions.length === 0}
              placeholder={intentOptions.length === 0 ? formatMessage('No intents configured for this dialog') : ''}
              errorMessage={formData.errors.intent}
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
