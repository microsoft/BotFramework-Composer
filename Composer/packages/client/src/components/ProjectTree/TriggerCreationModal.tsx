import React, { useState, useContext } from 'react';
import { Dialog, DialogType } from 'office-ui-fabric-react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, Stack, TextField, IDropdownOption } from 'office-ui-fabric-react';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { dialogGroups, DialogGroup } from 'shared-menus';

import { generateDialogWithNewTrigger } from '../../utils/dialogUtil';
import { StoreContext } from '../../store';
import { DialogInfo } from '../../store/types';

import { styles, dropdownStyles, name, dialogWindow, description } from './styles';
const isValidName = name => {
  const nameRegex = /^[a-zA-Z0-9-_.]+$/;
  return nameRegex.test(name);
};
const validateForm = (data: TriggerFormData): TriggerFormDataErrors => {
  const errors: TriggerFormDataErrors = {};
  const { name, $type } = data;
  if (!name || !isValidName(name)) {
    errors.name = formatMessage('Spaces and special characters are not allowed. Use letters, numbers, -, or _.');
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

interface TriggerFormData {
  errors: TriggerFormDataErrors;
  $type: string;
  name: string;
}

interface TriggerFormDataErrors {
  $type?: string;
  name?: string;
}

const initialFormData: TriggerFormData = {
  errors: {},
  $type: '',
  name: '',
};

const TriggerTypes = dialogGroups[DialogGroup.EVENTS].types;

const triggerTypeOptions: IDropdownOption[] = [
  {
    key: '',
    text: '',
  },
  ...TriggerTypes.map(t => {
    return {
      text: t,
      key: t,
    };
  }),
];

export const TriggerCreationModal: React.FC<TriggerCreationModalProps> = props => {
  // eslint-disable-next-line react/prop-types
  const { isOpen, onDismiss, onSubmit, dialogId } = props;
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
    setFormData({ ...formData, $type: option.key });
  };

  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue,
    });
  };

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
