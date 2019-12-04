// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Path from 'path';

import React, { useState, Fragment, useEffect, useContext } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { LocationSelectContent } from '../LocationBrowser/LocationSelectContent';
import { styles as wizardStyles } from '../StepWizard/styles';

import { StoreContext } from './../../store';
import { name, description } from './styles';

const MAXTRYTIMES = 10000;

export function DefineConversation(props) {
  const {
    onSubmit,
    onDismiss,
    enableLocationBrowse,
    focusedStorageFolder,
    onCurrentPathUpdate,
    currentPath,
    bots,
  } = props;

  const { state } = useContext(StoreContext);
  const { templateId, botName } = state;
  const [formData, setFormData] = useState({ name: getDefaultName() });
  const [formDataErrors, setFormDataErrors] = useState({ errors: {} });
  const [disable, setDisable] = useState(false);
  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue,
    });
  };

  const nameRegex = /^[a-zA-Z0-9-_.]+$/;
  const validateForm = data => {
    const errors = {};
    const { name } = data;

    if (!name || !nameRegex.test(name)) {
      errors.name = formatMessage(
        'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
      );
    }

    if (
      name &&
      ~bots.findIndex(bot => {
        const path = Path.join(focusedStorageFolder.parent, focusedStorageFolder.name, name);
        return bot.path === path;
      })
    ) {
      errors.name = formatMessage('Duplication of names');
    }
    return errors;
  };

  useEffect(() => {
    updateForm('location')(null, currentPath);
  }, [currentPath]);

  useEffect(() => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length) {
      setDisable(true);
    } else {
      setDisable(false);
    }
    setFormDataErrors(errors);
  }, [bots, formData.name]);

  const handleSubmit = e => {
    e.preventDefault();
    const errors = validateForm(formData);

    if (Object.keys(errors).length) {
      setFormDataErrors(errors);
      return;
    }

    onSubmit({
      ...formData,
    });
  };

  function getDefaultName() {
    let i = -1;
    const bot = templateId || botName;
    let defaultName = '';

    do {
      i++;
      defaultName = `${bot}-${i}`;
    } while (
      ~bots.findIndex(bot => {
        return bot.name === defaultName;
      }) &&
      i < MAXTRYTIMES
    );
    return defaultName;
  }

  return (
    <Fragment>
      <form onSubmit={handleSubmit}>
        <input type="submit" style={{ display: 'none' }} />
        <Stack horizontal={enableLocationBrowse} tokens={{ childrenGap: '2rem' }} styles={wizardStyles.stackinput}>
          <StackItem grow={0} styles={wizardStyles.halfstack}>
            <TextField
              label={formatMessage('Name')}
              value={formData.name}
              styles={name}
              onChange={updateForm('name')}
              errorMessage={formDataErrors.name}
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
        {enableLocationBrowse && (
          <LocationSelectContent
            onCurrentPathUpdate={onCurrentPathUpdate}
            focusedStorageFolder={focusedStorageFolder}
            currentPath={currentPath}
          />
        )}

        <DialogFooter>
          <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
          <PrimaryButton onClick={handleSubmit} text={formatMessage('Next')} disabled={disable} />
        </DialogFooter>
      </form>
    </Fragment>
  );
}
