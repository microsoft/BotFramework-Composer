// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, useContext, Fragment, useEffect } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import get from 'lodash/get';

import { LocationSelectContent } from '../LocationBrowser/LocationSelectContent';
import { styles as wizardStyles } from '../StepWizard/styles';
import { FileTypes } from '../../constants';

import { StoreContext } from './../../store';
import { name, description } from './styles';

const nameRegex = /^[a-zA-Z0-9-_.]+$/;

const validateForm = data => {
  const errors = {};
  const { name } = data;

  if (name && !nameRegex.test(name)) {
    errors.name = formatMessage(
      'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
    );
  }

  return errors;
};

export function DefineConversation(props) {
  const { state } = useContext(StoreContext);
  const { onSubmit, onGetErrorMessage, onDismiss, enableLocationBrowse } = props;
  const { templateId, focusedStorageFolder } = state;
  const [formData, setFormData] = useState({ errors: {} });
  const [location, setLocation] = useState('');
  const [disable, setDisable] = useState(false);

  useEffect(() => {
    const allFilesInFolder = get(focusedStorageFolder, 'children', []);

    const botsInCurrentFolder = allFilesInFolder.filter(file => {
      if (file.type === FileTypes.BOT) {
        return file;
      }
    });
    let i = 0;
    let defaultName = `${templateId}-${i}`;

    while (
      botsInCurrentFolder.findIndex(bot => {
        return bot.name === defaultName;
      }) > -1
    ) {
      i = i + 1;
      defaultName = `${templateId}-${i}`;
    }
    updateForm('defaultName')(null, defaultName);
  }, [templateId, focusedStorageFolder]);

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

    onSubmit(
      {
        ...formData,
      },
      location
    );
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

  return (
    <Fragment>
      <form onSubmit={handleSubmit}>
        <input type="submit" style={{ display: 'none' }} />
        <Stack horizontal={enableLocationBrowse} tokens={{ childrenGap: '2rem' }} styles={wizardStyles.stackinput}>
          <StackItem grow={0} styles={wizardStyles.halfstack}>
            <TextField
              label={formatMessage('Name')}
              value={formData.name || formData.defaultName}
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
        {enableLocationBrowse && <LocationSelectContent onChange={setLocation} allowOpeningBot={false} />}

        <DialogFooter>
          <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
          <PrimaryButton onClick={handleSubmit} text={formatMessage('Next')} disabled={disable} />
        </DialogFooter>
      </form>
    </Fragment>
  );
}
