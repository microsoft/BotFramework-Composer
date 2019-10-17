import React, { useState, useContext } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, Stack, IDropdownOption } from 'office-ui-fabric-react';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { get } from 'lodash';

import {
  addNewTrigger,
  getTriggerTypes,
  TriggerFormData,
  TriggerFormDataErrors,
  eventTypeKey,
  intentTypeKey,
  activityTypeKey,
  getEventTypes,
  getActivityTypes,
} from '../../utils/dialogUtil';
import { StoreContext } from '../../store';
import { DialogInfo } from '../../store/types';

import { styles, dropdownStyles, dialogWindow } from './styles';

const isValidName = name => {
  const nameRegex = /^[a-zA-Z0-9-_.]+$/;
  return nameRegex.test(name);
};
const validateForm = (data: TriggerFormData): TriggerFormDataErrors => {
  const errors: TriggerFormDataErrors = {};
  const { $type, eventType, activityType } = data;

  if ($type === eventTypeKey && !eventType) {
    errors.eventType = formatMessage('please select a event type');
  }

  if ($type === activityTypeKey && !activityType) {
    errors.activityType = formatMessage('please select an activity type');
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
  $type: intentTypeKey,
  intent: '',
  eventType: '',
  activityType: '',
};

const triggerTypeOptions: IDropdownOption[] = getTriggerTypes();

export const TriggerCreationModal: React.FC<TriggerCreationModalProps> = props => {
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
  const [formData, setFormData] = useState(initialFormData);
  const { state } = useContext(StoreContext);
  const { dialogs, luFiles } = state;
  const luFile = luFiles.find(lu => lu.id === dialogId);
<<<<<<< HEAD
  const dialogFile = dialogs.find(dialog => dialog.id === dialogId);
=======
>>>>>>> trigger align with the new schema

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
    // delete formData.eventType;
    // delete formData.activityType;
    setFormData({ ...initialFormData, $type: option.key });
  };

  const onSelectEventType = (e, option) => {
    setFormData({ ...formData, eventType: option.key });
  };

  const onSelectIntent = (e, option) => {
    setFormData({ ...formData, intent: option.key });
  };

  const onSelectActivityType = (e, option) => {
    setFormData({ ...formData, activityType: option.key });
  };

<<<<<<< HEAD
  const eventTypes = get(appschema, `definitions.['${eventTypeKey}'].properties.event.enum`, []).map(t => {
    return { key: t, text: t };
  });
=======
  const eventTypes: IDropdownOption[] = getEventTypes();
  const activityTypes: IDropdownOption[] = getActivityTypes();
>>>>>>> trigger align with the new schema

  const regexIntents = get(dialogFile, 'content.recognizer.intents', []);
  const luisIntents = get(luFile, 'parsedContent.LUISJsonStructure.intents', []);
  const intents = [...luisIntents, ...regexIntents];

  const intentOptions = intents.map(t => {
    return { key: t.name || t.intent, text: t.name || t.intent };
  });

  const showEventDropDown = formData.$type === eventTypeKey;
  const showIntentDropDown = formData.$type === intentTypeKey;
  const showActivityDropDown = formData.$type === activityTypeKey;

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
          {showIntentDropDown && (
            <Dropdown
              label={formatMessage('Which intent do you want to handle?')}
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
