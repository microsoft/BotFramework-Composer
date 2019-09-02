import React, { useContext, useState } from 'react';
import nanoid from 'nanoid/generate';
import { get, set, cloneDeep } from 'lodash';
import { Dialog, DialogType } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, Stack, TextField } from 'office-ui-fabric-react';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';

import { StoreContext } from '../../store';

import { styles, dropdownStyles } from './styles';
export const TriggerCreationModel = props => {
  // eslint-disable-next-line react/prop-types
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  //const [triggerType, setTriggerType] = useState(null);
  const [formData, setFormData] = useState({});
  const { state } = useContext(StoreContext);
  const { dialogs } = state;
  const onClickSubmitButton = () => {
    const inputDialog = dialogs.find(d => d.id === dialogId);
    const newDialog = generateDialogWithNewTrigger(inputDialog, formData);
    onSubmit(newDialog);
  };

  const onSelectTriggerType = (e, option) => {
    //setTriggerType(option.$type);
    setFormData({ ...formData, $type: option.$type });
  };

  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue,
    });
  };

  //   const onSelectIntents = (e, option) => {
  //     setFormData({ ...formData, intent: option.key });
  //   };

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
      },
      //intent: data.intent,
      ...seedNewDialog(data.$type),
    };

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

  //   const showIntentDropDown = triggerType === 'Microsoft.IntentRule';
  //   const showEventDropDown = triggerType === 'Microsoft.EventRule';

  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title: 'subTitle',
        subText: 'subText',
        styles: styles.dialog,
      }}
      modalProps={{
        isBlocking: false,
        styles: styles.modal,
      }}
    >
      <div css={{ height: '300px', width: '500px' }}>
        <Stack>
          <Dropdown
            placeholder="select a trigger type"
            label="What is the trigger?"
            options={triggerTypeOptions}
            styles={dropdownStyles}
            onChange={onSelectTriggerType}
          />
          <TextField
            label={formatMessage('Name')}
            styles={name}
            onChange={updateForm('name')}
            errorMessage={formData.errors.name}
            onGetErrorMessage={getErrorMessage}
          />
          <TextField
            styles={description}
            label={formatMessage('Description')}
            multiline
            resizable={false}
            onChange={updateForm('description')}
          />
          {/* {showIntentDropDown && (
            <Dropdown
              placeholder="Create a new or select an intent"
              label="Select a trigger type"
              options={}
              styles={dropdownStyles}
              onChange={onSelectIntents}
            />
          )}
          {showEventDropDown && (
            <Dropdown
              placeholder="event event"
              label="Select a trigger type"
              options={intentsOptions}
              styles={}
              onChange={onSelectTriggerType}
            />
          )} */}
        </Stack>
      </div>
      <DialogFooter>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={onClickSubmitButton} text={formatMessage('Submit')} />
      </DialogFooter>
    </Dialog>
  );
};
