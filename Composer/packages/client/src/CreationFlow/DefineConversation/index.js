import React, { useState, useContext, useEffect, useRef, Fragment } from 'react';
import formatMessage from 'format-message';
import { DialogFooter, PrimaryButton, DefaultButton, Stack, StackItem, TextField } from 'office-ui-fabric-react';

import { LocationSelectContent } from '../LocationBrowser/LocationSelectContent';
import { styles as wizardStyles } from '../StepWizard/styles';

import { StoreContext } from './../../store';
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
  const { onSubmit, onGetErrorMessage, onDismiss, enableLocationBrowse } = props;
  const { state } = useContext(StoreContext);
  const { storages } = state;
  const currentStorageIndex = useRef(0);

  const [formData, setFormData] = useState({ errors: {} });
  const [disable, setDisable] = useState(false);

  // set the default path
  useEffect(() => {
    const index = currentStorageIndex.current;
    if (storages[index]) {
      updateForm('location')(null, storages[index].path);
    }
  }, [storages]);

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

  // // update the path in the form and toggle the location picker.
  const updateLocation = path => {
    updateForm('location')(null, path);
  };

  return (
    <Fragment>
      <form onSubmit={handleSubmit}>
        <input type="submit" style={{ display: 'none' }} />
        <Stack horizontal={enableLocationBrowse} gap="2rem" styles={wizardStyles.stackinput}>
          <StackItem grow={0} styles={wizardStyles.halfstack}>
            <TextField
              label={formatMessage('Name')}
              value={formData.name}
              styles={name}
              onChange={updateForm('name')}
              errorMessage={formData.errors.name}
              onGetErrorMessage={getErrorMessage}
              data-testid="NewDialogName"
            />
          </StackItem>
          <StackItem grow={0} styles={wizardStyles.halfstack}>
            <TextField
              styles={description}
              value={formData.description}
              label={formatMessage('Description')}
              multiline
              resizable={false}
              onChange={updateForm('description')}
            />
          </StackItem>
        </Stack>
        {enableLocationBrowse && <LocationSelectContent onChange={updateLocation} />}

        <DialogFooter>
          <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
          <PrimaryButton onClick={handleSubmit} text={formatMessage('Next')} disabled={disable} />
        </DialogFooter>
      </form>
    </Fragment>
  );
}
