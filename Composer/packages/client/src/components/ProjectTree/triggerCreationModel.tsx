import React, { useState, useContext } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, Stack, TextField, IDropdownOption } from 'office-ui-fabric-react';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';

import { generateDialogWithNewTrigger } from '../../utils/dialogUtil';
import { StoreContext } from '../../store';
import { NewTriggerType, EventTypes } from '../../constants';
import { DialogInfo } from '../../store/types';

import { styles, dropdownStyles, name, dialogWindow, description } from './styles';
const nameRegex = /^[a-zA-Z0-9-_.]+$/;
const validateForm = data => {
  const errors: TriggerFromDataErrors = {};
  const { name, $type, event } = data;
  if (!name || !nameRegex.test(name)) {
    errors.name = formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
  }

  if (!$type) {
    errors.$type = formatMessage('please select a trigger type');
  }

  if ($type === 'Microsoft.EventRule' && !event) {
    errors.event = formatMessage('please select a event type');
  }
  return errors;
};

interface TriggerCreationModelProps {
  dialogId: string;
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (dialog: DialogInfo) => void;
}

interface TriggerFromData {
  errors: TriggerFromDataErrors;
  $type: string;
  name: string;
  event: string;
}

interface TriggerFromDataErrors {
  $type?: string;
  name?: string;
  event?: string;
}

const initialFormData: TriggerFromData = {
  errors: {},
  $type: '',
  name: '',
  event: '',
};

export const TriggerCreationModel: React.FC<TriggerCreationModelProps> = props => {
  // eslint-disable-next-line react/prop-types
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  const [triggerType, setTriggerType] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
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
    setTriggerType(option.key);
    setFormData({ ...formData, $type: option.key });
  };

  const onSelectEvent = (e, option) => {
    setFormData({ ...formData, event: option.key });
  };

  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue,
    });
  };

  const triggerTypeOptions: IDropdownOption[] = [
    {
      key: '',
      text: '',
    },
    ...NewTriggerType,
  ];

  const eventTypes: IDropdownOption[] = EventTypes.map(t => {
    return {
      text: t,
      key: t,
    };
  });

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
            css={dropdownStyles}
            onChange={onSelectTriggerType}
            errorMessage={formData.errors.$type}
            data-testid={'triggerTypeDropDown'}
          />
          {showEventDropDown && (
            <Dropdown
              placeholder="select a event type"
              label="What is the event?"
              options={eventTypes}
              css={dropdownStyles}
              onChange={onSelectEvent}
              errorMessage={formData.errors.event}
              data-testid={'eventTypeDropDown'}
            />
          )}
          <TextField
            label={formatMessage('Name')}
            styles={name}
            onChange={updateForm('name')}
            errorMessage={formData.errors.name}
            data-testid={'triggerName'}
          />
          <TextField
            styles={description}
            label={formatMessage('Description')}
            multiline
            resizable={false}
            onChange={updateForm('description')}
            data-testid={'triggerDescription'}
          />
        </Stack>
      </div>
      <DialogFooter>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={onClickSubmitButton} text={formatMessage('Submit')} data-testid={'triggerFormSubmit'} />
      </DialogFooter>
    </Dialog>
  );
};
