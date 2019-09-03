import React, { useState, Fragment } from 'react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, Stack, TextField } from 'office-ui-fabric-react';

import { LocationPicker } from '../LocationBrowser/LocationPicker';

import { name, description } from './styles';

const nameRegex = /^[a-zA-Z0-9-_.]+$/;

const validateForm = data => {
  const errors = {};
  const { name } = data;

  if (!name || !nameRegex.test(name)) {
    errors.name = formatMessage(
      'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
    );
  }

  return errors;
};

export function DefineConversation(props) {
  const { onSubmit, onGetErrorMessage, onDismiss } = props;
  const [formData, setFormData] = useState({ errors: {} });
  const [disable, setDisable] = useState(false);
  const [locationActive, setLocationActive] = useState(false);

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

  //disable the next button if the text has errors.
  const getErrorMessage = text => {
    if (typeof onGetErrorMessage === 'function') {
      const result = onGetErrorMessage(text);
      if (result === '' && disable) {
        setDisable(false);
      }

      if (result !== '' && !disable) {
        setDisable(true);
      }

      return result;
    } else {
      return '';
    }
  };

  const activateLocationPicker = active => {
    setLocationActive(active);
  };

  const changeLocation = path => {
    updateForm('location')(null, path);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        {!locationActive && (
          <Fragment>
            <TextField
              label={formatMessage('Name')}
              styles={name}
              onChange={updateForm('name')}
              errorMessage={formData.errors.name}
              onGetErrorMessage={getErrorMessage}
              data-testid="NewDialogName"
            />
            <TextField
              styles={description}
              label={formatMessage('Description')}
              multiline
              resizable={false}
              onChange={updateForm('description')}
            />
          </Fragment>
        )}
        <LocationPicker onActivate={activateLocationPicker} onChange={changeLocation} />
      </Stack>
      <DialogFooter>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={handleSubmit} text={formatMessage('Next')} disabled={disable} />
      </DialogFooter>
    </form>
  );
}
