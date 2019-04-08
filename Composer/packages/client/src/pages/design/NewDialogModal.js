import React, { useState, useEffect } from 'react';
import { Modal, IconButton, TextField, Button, Dropdown, DropdownMenuItemType } from 'office-ui-fabric-react';

const nameRegex = /^[a-zA-Z0-9-_]+$/;

const validateForm = data => {
  const errors = {};
  const { name, steps } = data;

  if (!name || !nameRegex.test(name)) {
    errors.name = 'must only use letters, numbers, -, and _';
  }

  if (!steps || !steps.length === 0) {
    errors.steps = 'at least one step is required';
  }

  return errors;
};

const dialogGroups = {
  'Input/Prompt Dialogs': [
    'Microsoft.ConfirmInput',
    'Microsoft.FloatInput',
    'Microsoft.IntegerInput',
    'Microsoft.TextInput',
  ],
  'Dialog Steps': [
    'Microsoft.BeginDialog',
    'Microsoft.CancelDialog',
    'Microsoft.EndDialog',
    'Microsoft.EndTurn',
    'Microsoft.HttpRequest',
    'Microsoft.IfCondition',
    'Microsoft.ReplaceWithDialog',
    'Microsoft.SendActivity',
    'Microsoft.SendList',
    'Microsoft.SwitchCondition',
  ],
  Memory: ['Microsoft.DeleteProperty', 'Microsoft.EditArray', 'Microsoft.SaveEntity'],
  Rules: [
    'Microsoft.EventRule',
    'Microsoft.IfPropertyRule',
    'Microsoft.IntentRule',
    'Microsoft.NoMatchRule',
    'Microsoft.Rule',
    'Microsoft.WelcomeRule',
  ],
  Recognizers: [/* 'Microsoft.LuisRecognizer' */ 'Microsoft.MultiLanguageRecognizers', 'Microsoft.RegexRecognizer'],
  Other: ['Microsoft.AdaptiveDialog'],
};

const buildDialogOptions = () => {
  const options = [];

  for (const elem in dialogGroups) {
    options.push({ key: elem, text: elem, itemType: DropdownMenuItemType.Header });
    dialogGroups[elem].forEach(dialog => {
      options.push({ key: dialog, text: dialog });
    });
    options.push({ key: `${elem}_divider`, text: '-', itemType: DropdownMenuItemType.Divider });
  }

  return options;
};

export default function NewDialogModal(props) {
  const { isOpen, onDismiss, onSubmit } = props;
  const [formData, setFormData] = useState({ errors: {} });

  useEffect(() => {
    setFormData({ errors: {} });
  }, [isOpen]);

  const updateForm = field => (e, newValue) => {
    let value = newValue;

    if (field === 'steps') {
      value = formData.steps || [];

      if (newValue.selected) {
        value.push(newValue.key);
      } else {
        const idx = value.indexOf(newValue.key);
        if (idx > -1) {
          value.splice(idx, 1);
        }
      }
    }

    setFormData({ ...formData, errors: {}, [field]: value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errors = validateForm(formData);

    if (Object.keys(errors).length) {
      setFormData({ ...formData, errors });
      return;
    }

    onSubmit({ ...formData });
  };

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} styles={{ main: { maxWidth: '500px', width: '100%' } }}>
      <div style={{ padding: '30px' }}>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <IconButton
            iconProps={{ iconName: 'ChromeClose' }}
            title="Add Dialog"
            ariaLabel="Add Dialog"
            onClick={onDismiss}
          />
        </div>
        <div>
          <form onSubmit={handleSubmit}>
            <TextField label="Dialog Name" onChange={updateForm('name')} required errorMessage={formData.errors.name} />
            <Dropdown
              label="Steps"
              description="Type of first step in the dialog"
              options={buildDialogOptions()}
              onChange={updateForm('steps')}
              multiSelect
              selectedKeyd={formData.steps}
              errorMessage={formData.errors.steps}
              required
            />
            <Button
              onClick={handleSubmit}
              type="submit"
              primary
              styles={{ root: { width: '100%', marginTop: '20px' } }}
            >
              Create New Dialog
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
