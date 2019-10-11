import React, { useState, useContext } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton, Stack, TextField, IDropdownOption, Checkbox } from 'office-ui-fabric-react';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import nanoid from 'nanoid/generate';
import { toLower } from 'lodash';

import {
  addNewTrigger,
  getTriggerTypes,
  getEventTypes,
  getActivityTypes,
  TriggerFormData,
  TriggerFormDataErrors,
  eventTypeKey,
  intentTypeKey,
  activityTypeKey,
  customerTypeKey,
} from '../../utils/dialogUtil';
import { StoreContext } from '../../store';
import { DialogInfo } from '../../store/types';

import {
  styles,
  dropdownStyles,
  name,
  dialogWindow,
  constraint,
  dialogFooterContainer,
  dialogFooterRight,
  marginRight,
  marginBottom,
} from './styles';

const isValidName = name => {
  const nameRegex = /^[a-zA-Z0-9-_.]+$/;
  return nameRegex.test(name);
};
const validateForm = (data: TriggerFormData): TriggerFormDataErrors => {
  const errors: TriggerFormDataErrors = {};
  const { name, $type, eventType, activityType } = data;
  if (!!name && !isValidName(name)) {
    errors.name = formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
  }

  if ($type === eventTypeKey && !eventType) {
    errors.eventType = formatMessage('please select a event type');
  }

  if ($type === activityTypeKey && !activityType) {
    errors.eventType = formatMessage('please select an activity type');
  }

  if (!$type) {
    errors.$type = formatMessage('please select a trigger type');
  }
  return errors;
};

const validateFormOnFirstStep = (data: TriggerFormData): TriggerFormDataErrors => {
  const errors: TriggerFormDataErrors = {};
  const { $type } = data;
  if (!$type) {
    errors.$type = formatMessage('please select a trigger type');
  }
  return errors;
};

interface TriggerCreationModalProps {
  dialogId: string;
  isOpen: boolean;
  onDismiss: () => void;
  onSubmit: (dialog: DialogInfo, newDailogName: string) => void;
}

const initialFormData: TriggerFormData = {
  errors: {},
  $type: '',
  name: '',
  constraint: '',
  eventType: '',
  activityType: '',
  toCreateNewDialog: false,
};

const triggerTypeOptions: IDropdownOption[] = getTriggerTypes();

export const TriggerCreationModal: React.FC<TriggerCreationModalProps> = props => {
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  const [formData, setFormData] = useState(initialFormData);
  const [step, setStep] = useState(0);
  const { state } = useContext(StoreContext);
  const { dialogs } = state;

  const isDuplicatedDialogName = () => {
    const dialog = dialogs.find(dialog => toLower(dialog.id) === toLower(formData.name));
    if (dialog) {
      return true;
    }
    return false;
  };

  const onNext = () => {
    if (step === 0) {
      const errors = validateFormOnFirstStep(formData);

      if (Object.keys(errors).length) {
        setFormData({
          ...formData,
          errors,
        });
        return;
      }
      setStep(step + 1);
      delete formData.errors.$type;
      return;
    } else if (step === 1) {
      submitForm();
    }
  };

  const onBack = () => {
    setStep(step - 1);
  };

  const onCheck = (e, value) => {
    setFormData({ ...formData, toCreateNewDialog: value });
  };

  const submitForm = () => {
    const errors = validateForm(formData);
    const isDuplicated = isDuplicatedDialogName();
    if (isDuplicated && formData.toCreateNewDialog && formData.$type === intentTypeKey) {
      errors.name = `The dialog '${formData.name}' you are going to create already exists`;
    }
    if (Object.keys(errors).length) {
      setFormData({
        ...formData,
        errors,
      });
      return;
    }
    let newDialogName = '';
    if (formData.toCreateNewDialog) {
      newDialogName = formData.$type === intentTypeKey ? formData.name : 'newDialog' + nanoid('1234567890', 6);
    }
    const updatedDialog = addNewTrigger(dialogs, dialogId, formData, newDialogName);
    onSubmit(updatedDialog, newDialogName);
    onDismiss();
  };

  const onSelectTriggerType = (e, option) => {
    delete formData.eventType;
    setFormData({ ...formData, $type: option.key });
  };

  const onSelectEventType = (e, option) => {
    setFormData({ ...formData, eventType: option.key });
  };

  const onSelectActivityType = (e, option) => {
    setFormData({ ...formData, activityType: option.key });
  };

  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue,
    });
  };

  const eventTypes: IDropdownOption[] = getEventTypes();
  const activityTypes: IDropdownOption[] = getActivityTypes();

  const showEventDropDown = formData.$type === eventTypeKey && step > 0;
  const showActivityDropDown = formData.$type === activityTypeKey && step > 0;
  const showNameField = (formData.$type === intentTypeKey || formData.$type === customerTypeKey) && step > 0;
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
      <div css={dialogWindow(step > 0)}>
        <Stack>
          <Dropdown
            label={formatMessage('What do you want this trigger to handle?')}
            options={triggerTypeOptions}
            styles={dropdownStyles}
            onChange={onSelectTriggerType}
            errorMessage={formData.errors.$type}
            data-testid={'triggerTypeDropDown'}
            disabled={step > 0}
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

          {showActivityDropDown && (
            <Dropdown
              placeholder="select an activity type"
              label="Which activity?"
              options={activityTypes}
              styles={dropdownStyles}
              onChange={onSelectActivityType}
              errorMessage={formData.errors.activityType}
              data-testid={'activityTypeDropDown'}
            />
          )}
          {showNameField && (
            <TextField
              label={formatMessage('What is the name of this trigger?')}
              styles={name}
              onChange={updateForm('name')}
              errorMessage={formData.errors.name}
              data-testid={'triggerName'}
            />
          )}
          {step > 0 && (
            <TextField
              styles={constraint}
              placeholder={formatMessage('ex. user.vip == true')}
              label={formatMessage('Constraint')}
              resizable={false}
              onChange={updateForm('constraint')}
              data-testid={'triggerConstraint'}
            />
          )}
        </Stack>
      </div>
      {step > 0 && (
        <div css={marginBottom}>
          <Checkbox
            label={
              formData.$type === intentTypeKey
                ? formatMessage('Create a dialog with the same name as this trigger')
                : formatMessage('Create a dialog to contain this dialog')
            }
            onChange={onCheck}
          />
        </div>
      )}
      <div css={dialogFooterContainer}>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        <div css={dialogFooterRight}>
          {step > 0 && (
            <div css={marginRight}>
              <DefaultButton onClick={onBack} text={formatMessage('Back')} />
            </div>
          )}
          <div>
            <PrimaryButton onClick={onNext} text={formatMessage('Next')} data-testid={'triggerFormSubmit'} />
          </div>
        </div>
      </div>
    </Dialog>
  );
};
