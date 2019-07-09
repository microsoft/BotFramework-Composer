/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState } from 'react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, Stack, TextField } from 'office-ui-fabric-react';

import { name, description } from './styles';

const nameRegex = /^[a-zA-Z0-9-_.]+$/;

const validateForm = data => {
  const errors = {};
  const { name } = data;

  if (!name || !nameRegex.test(name)) {
    errors.name = 'must only use letters, numbers, -, and _';
  }

  return errors;
};

export function DefineConversation(props) {
  const { onSubmit, onGetErrorMessage, onDismiss } = props;
  const [formData, setFormData] = useState({ errors: {} });

  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      errors: {},
      [field]: newValue,
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errors = validateForm(formData);

    if (Object.keys(errors).length) {
      setFormData({
        ...formData,
        errors,
      });
      return;
    }

    onSubmit({
      ...formData,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextField
          label={formatMessage('Name')}
          styles={name}
          onChange={updateForm('name')}
          errorMessage={formData.errors.name}
          onGetErrorMessage={onGetErrorMessage}
          data-testid="NewDialogName"
        />
        <TextField
          styles={description}
          label={formatMessage('Description')}
          multiline
          resizable={false}
          onChange={updateForm('description')}
        />
      </Stack>
      <DialogFooter>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={handleSubmit} text={formatMessage('Next')} />
      </DialogFooter>
    </form>
  );
}
