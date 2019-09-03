import React, { useState, useContext } from 'react';
import nanoid from 'nanoid/generate';
import { get, set, cloneDeep } from 'lodash';
import { Dialog, DialogType } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, Stack, TextField } from 'office-ui-fabric-react';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';

import { StoreContext } from '../../store';

import { styles, dropdownStyles, name, dialogWindow, description } from './styles';

const nameRegex = /^[a-zA-Z0-9-_.]+$/;
const validateForm = data => {
  const errors = {};
  const { name, $type, event } = data;
  if (!name || !nameRegex.test(name)) {
    errors.name = formatMessage(
      'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
    );
  }

  if (!$type) {
    errors.$type = formatMessage('please select a trigger type');
  }

  if ($type === 'Microsoft.EventRule' && !event) {
    errors.event = formatMessage('please select a event type');
  }
  return errors;
};
export const TriggerCreationModel = props => {
  // eslint-disable-next-line react/prop-types
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  const [triggerType, setTriggerType] = useState(null);
  const [formData, setFormData] = useState({ errors: {} });
  const { state } = useContext(StoreContext);
  const { dialogs } = state;

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
    const inputDialog = dialogs.find(d => d.id === dialogId);
    const newDialog = generateDialogWithNewTrigger(inputDialog, formData);
    onSubmit(newDialog);
    onDismiss();
  };

  const onSelectTriggerType = (e, option) => {
    setTriggerType(option.$type);
    setFormData({ ...formData, $type: option.$type });
  };

  const onSelectEvent = (e, option) => {
    setFormData({ ...formData, event: option.event });
  };

  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue,
    });
  };

  const initialDialogShape = {
    'Microsoft.ConversationUpdateActivityRule': {
      $type: 'Microsoft.ConversationUpdateActivityRule',
      constraint: "toLower(turn.Activity.membersAdded[0].name) != 'bot'",
    },
  };

  const seedNewDialog = $type => {
    return initialDialogShape[$type] ? initialDialogShape[$type] : {};
  };

  function generateDialogWithNewTrigger(inputDialog, data) {
    const dialog = cloneDeep(inputDialog);
    const rules = get(dialog, 'content.rules', []);
    const newStep = {
      $type: data.$type,
      $designer: {
        name: data.name,
        id: nanoid('1234567890', 6),
        description: data.description,
      },
      //intent: data.intent,
      ...seedNewDialog(data.$type),
    };
    if (data.event) {
      newStep.events = [data.event];
    }

    rules.push(newStep);

    set(dialog, 'content.rules', rules);
    return dialog;
  }

  const triggerTypeOptions = [
    {
      $type: null,
      key: '',
      text: '',
      disable: true,
    },
    {
      $type: 'Microsoft.EventRule',
      key: 'Microsoft.EventRule',
      text: 'Handle an Event',
    },
    {
      $type: 'Microsoft.IntentRule',
      key: 'Microsoft.IntentRule',
      text: 'Handle an Intent',
    },
    {
      $type: 'Microsoft.UnknownIntentRule',
      key: 'Microsoft.UnknownIntentRule',
      text: 'Handle Unknown Intent',
    },
    {
      $type: 'Microsoft.ConversationUpdateActivityRule',
      key: 'Microsoft.ConversationUpdateActivityRule',
      text: 'Handle ConversationUpdate',
    },
  ];

  const eventTypes = [
    {
      text: 'beginDialog',
      event: 'beginDialog',
    },
    {
      text: 'resumeDialog',
      event: 'resumeDialog',
    },
    {
      text: 'cancelDialog',
      event: 'cancelDialog',
    },
    {
      text: 'endDialog',
      event: 'endDialog',
    },
  ];

  const showEventDropDown = triggerType === 'Microsoft.EventRule';

  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: 'Create a trigger',
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
            placeholder="select a trigger type"
            label="What is the trigger?"
            options={triggerTypeOptions}
            styles={dropdownStyles}
            onChange={onSelectTriggerType}
            errorMessage={formData.errors.$type}
          />
          {showEventDropDown && (
            <Dropdown
              placeholder="select a event type"
              label="What is the event?"
              options={eventTypes}
              styles={dropdownStyles}
              onChange={onSelectEvent}
              errorMessage={formData.errors.event}
            />
          )}
          <TextField
            label={formatMessage('Name')}
            styles={name}
            onChange={updateForm('name')}
            errorMessage={formData.errors.name}
          />
          <TextField
            styles={description}
            label={formatMessage('Description')}
            multiline
            resizable={false}
            onChange={updateForm('description')}
          />
        </Stack>
      </div>
      <DialogFooter>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={onClickSubmitButton} text={formatMessage('Submit')} />
      </DialogFooter>
    </Dialog>
  );
};
