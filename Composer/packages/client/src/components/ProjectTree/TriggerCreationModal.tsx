import React, { useState, useContext } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, Stack, TextField, IDropdownOption } from 'office-ui-fabric-react';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { get } from 'lodash';

import { addNewTrigger, getTriggerTypes, TriggerFormData, TriggerFormDataErrors } from '../../utils/dialogUtil';
import { StoreContext } from '../../store';
import { DialogInfo } from '../../store/types';

import { styles, dropdownStyles, name, dialogWindow, constraint } from './styles';

const eventTypeKey = 'Microsoft.OnDialogEvent';

const isValidName = name => {
  const nameRegex = /^[a-zA-Z0-9-_.]+$/;
  return nameRegex.test(name);
};
const validateForm = (data: TriggerFormData): TriggerFormDataErrors => {
  const errors: TriggerFormDataErrors = {};
  const { name, $type, eventType } = data;
  if (!name || !isValidName(name)) {
    errors.name = formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
  }

  if ($type === eventTypeKey && !eventType) {
    errors.eventType = formatMessage('please select a event type');
  }

  if (!$type) {
    errors.$type = formatMessage('please select a trigger type');
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
  $type: '',
  name: '',
  constraint: '',
  eventType: '',
};

const triggerTypeOptions: IDropdownOption[] = getTriggerTypes();

export const TriggerCreationModal: React.FC<TriggerCreationModalProps> = props => {
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  const [formData, setFormData] = useState(initialFormData);
  const { state } = useContext(StoreContext);
  const { dialogs, schemas } = state;

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
    delete formData.eventType;
    setFormData({ ...formData, $type: option.key });
  };

  const onSelectEventType = (e, option) => {
    setFormData({ ...formData, eventType: option.key });
  };

  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue,
    });
  };
  const eventTypes = get(schemas, `sdk.content.definitions.['${eventTypeKey}'].properties.events.items.enum`, []).map(
    t => {
      return { key: t, text: t };
    }
  );
  const showEventDropDown = formData.$type === eventTypeKey;
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
          />

          {showEventDropDown && (
            <Dropdown
              placeholder="select a event type"
              label="What is the event?"
              options={eventTypes}
              styles={dropdownStyles}
              onChange={onSelectEventType}
              errorMessage={formData.errors.eventType}
              data-testid={'eventTypeDropDown'}
            />
          )}
          <TextField
            label={formatMessage('What is the name of this trigger?')}
            styles={name}
            onChange={updateForm('name')}
            errorMessage={formData.errors.name}
            data-testid={'triggerName'}
          />
          <TextField
            styles={constraint}
            label={formatMessage('Constraint')}
            multiline
            resizable={false}
            onChange={updateForm('constraint')}
            data-testid={'triggerConstraint'}
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
