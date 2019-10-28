import React, { useState } from 'react';
import { DialogFooter, PrimaryButton, DefaultButton } from 'office-ui-fabric-react';
import formatMessage from 'format-message';

import { DialogModal } from '../../CreationFlow/DialogModal/index';
import { LocationSelectContent } from '../LocationBrowser/LocationSelectContent';
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

export default function DefineConversation(props) {
  const { onDismiss, onSubmit, onGetErrorMessage } = props;
  const [formData, setFormData] = useState({ errors: {} });
  const [disable, setDisable] = useState(false);
  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      errors: {},
      [field]: newValue,
    });
  };

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

  const updateLocation = path => {
    updateForm('location')(null, path);
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogModal
        onGetErrorMessage={onGetErrorMessage}
        getErrorMessage={getErrorMessage}
        updateForm={updateForm}
        formData={formData}
        horizontal={true}
      />
      <LocationSelectContent onChange={updateLocation} />
      <DialogFooter>
        <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={handleSubmit} text={formatMessage('Next')} disabled={disable} />
      </DialogFooter>
    </form>
  );
}
