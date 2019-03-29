import React, { useState } from 'react';
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

export const dialogGroups = {
  'Input/Prompt Dialogs': [
    'Microsoft.TextPrompt',
    'Microsoft.DateTimePrompt',
    'Microsoft.FloatPrompt',
    'Microsoft.IntegerPrompt',
  ],
  'Dialog Steps': [
    'Microsoft.CallDialog',
    'Microsoft.GotoDialog',
    'Microsoft.EndDialog',
    'Microsoft.CancelDialog',
    'Microsoft.SendActivity',
    'Microsoft.IfProperty',
    'Microsoft.HttpRequest',
  ],
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
