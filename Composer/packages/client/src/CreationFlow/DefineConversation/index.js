import React, { useState, Fragment } from 'react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, Stack, TextField } from 'office-ui-fabric-react';

import { LocationSelectContent } from '../LocationBrowser/LocationSelectContent';

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
  const [customPath, setCustomPath] = useState('');

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

  const toggleLocationPicker = () => {
    setLocationActive(!locationActive);
  };

  const changeLocation = path => {
    setCustomPath(path);
  };

  const updateLocation = () => {
    updateForm('location')(null, customPath);
    toggleLocationPicker();
  };

  return (
    <form onSubmit={handleSubmit}>
      {!locationActive && (
        <Fragment>
          <Stack>
            <TextField
              label={formatMessage('Name')}
              value={formData.name}
              styles={name}
              onChange={updateForm('name')}
              errorMessage={formData.errors.name}
              onGetErrorMessage={getErrorMessage}
              data-testid="NewDialogName"
            />
            <TextField
              styles={description}
              value={formData.description}
              label={formatMessage('Description')}
              multiline
              resizable={false}
              onChange={updateForm('description')}
            />
            <p>
              <label>Location</label>
              <br />
              <i>{formData.location}</i>
              <button onClick={toggleLocationPicker}>Browse</button>
            </p>
          </Stack>
          <DialogFooter>
            <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
            <PrimaryButton onClick={handleSubmit} text={formatMessage('Next')} disabled={disable} />
          </DialogFooter>
        </Fragment>
      )}
      {locationActive && (
        <Fragment>
          <Stack>
            <p>
              <label>Location</label>
              <br />
              <i>{customPath}</i>
            </p>
            <LocationSelectContent onChange={changeLocation} />
          </Stack>
          <DialogFooter>
            <DefaultButton onClick={toggleLocationPicker} text={formatMessage('Cancel')} />
            <PrimaryButton onClick={updateLocation} text={formatMessage('OK')} />
          </DialogFooter>
        </Fragment>
      )}
    </form>
  );
}
