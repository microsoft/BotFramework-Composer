import React, { useState, useContext } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton, Stack, TextField, IDropdownOption } from 'office-ui-fabric-react';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { get } from 'lodash';

import {
  addNewTrigger,
  getTriggerTypes,
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
} from './styles';

const isValidName = name => {
  const nameRegex = /^[a-zA-Z0-9-_.]+$/;
  return nameRegex.test(name);
};
const validateForm = (data: TriggerFormData): TriggerFormDataErrors => {
  const errors: TriggerFormDataErrors = {};
  const { name, $type, eventType, activityType } = data;
  if (!name || !isValidName(name)) {
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
  onSubmit: (dialog: DialogInfo) => void;
}

const initialFormData: TriggerFormData = {
  errors: {},
  $type: '',
  name: '',
  constraint: '',
  eventType: '',
  activityType: '',
};

const triggerTypeOptions: IDropdownOption[] = getTriggerTypes();

export const TriggerCreationModal: React.FC<TriggerCreationModalProps> = props => {
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  const [formData, setFormData] = useState(initialFormData);
  const [step, setStep] = useState(0);
  const { state } = useContext(StoreContext);
  const { dialogs, schemas } = state;

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

  const submitForm = () => {
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

  const onSelectActivityType = (e, option) => {
    setFormData({ ...formData, activityType: option.key });
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
      <div css={dialogWindow}>
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
              label={formatMessage('Constraint')}
              multiline
              resizable={false}
              onChange={updateForm('constraint')}
              data-testid={'triggerConstraint'}
            />
          )}
        </Stack>
      </div>
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
