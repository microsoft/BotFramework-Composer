// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Path from 'path';

import React, { useState, Fragment, useEffect, useContext } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import get from 'lodash/get';

import { LocationSelectContent } from '../LocationBrowser/LocationSelectContent';
import { styles as wizardStyles } from '../StepWizard/styles';
import { StoreContext } from '../../store';

import { name, description } from './styles';
const MAXTRYTIMES = 10000;

interface FormData {
  name: string;
  description: string;
  location: string;
}

interface FormDataError {
  name?: string;
  location?: string;
}

interface DefineConversationProps {
  onSubmit: (formData: FormData) => void;
  onDismiss: () => void;
  onCurrentPathUpdate: (newPath?: string, storageId?: string) => void;
  onGetErrorMessage?: (text: string) => void;
}

const initialFormDataError: FormDataError = {};

export const DefineConversation: React.FC<DefineConversationProps> = (props) => {
  const { onSubmit, onDismiss, onCurrentPathUpdate } = props;
  const { state } = useContext(StoreContext);
  const { templateId, focusedStorageFolder } = state;
  const files = get(focusedStorageFolder, 'children', []);
  const getDefaultName = () => {
    let i = -1;
    const bot = templateId;
    let defaultName = '';
    do {
      i++;
      defaultName = `${bot}-${i}`;
    } while (
      files &&
      files.find((file) => {
        return file.name.toLowerCase() === defaultName.toLowerCase();
      }) &&
      i < MAXTRYTIMES
    );
    return defaultName;
  };

  const initalFormData: FormData = { name: getDefaultName(), description: '', location: '' };
  const [formData, setFormData] = useState(initalFormData);
  const [formDataErrors, setFormDataErrors] = useState(initialFormDataError);
  const [disable, setDisable] = useState(false);
  const updateForm = (field) => (e, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue,
    });
  };

  const nameRegex = /^[a-zA-Z0-9-_.]+$/;
  const validateForm = (data: FormData) => {
    const errors: FormDataError = {};
    const { name } = data;
    if (!name || !nameRegex.test(name)) {
      errors.name = formatMessage(
        'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
      );
    }
    const newBotPath =
      focusedStorageFolder && Object.keys(focusedStorageFolder as Record<string, any>).length
        ? Path.join(focusedStorageFolder.parent, focusedStorageFolder.name, name)
        : '';
    if (
      name &&
      files &&
      files.find((bot) => {
        return bot.path.toLowerCase() === newBotPath.toLowerCase();
      })
    ) {
      errors.name = formatMessage('Duplication of names');
    }
    return errors;
  };

  useEffect(() => {
    const currentPath = Path.join(focusedStorageFolder.parent || '', focusedStorageFolder.name || '');
    updateForm('location')(null, currentPath);
  }, [focusedStorageFolder]);

  useEffect(() => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length || !focusedStorageFolder.writable) {
      setDisable(true);
    } else {
      setDisable(false);
    }
    setFormDataErrors(errors);
  }, [focusedStorageFolder, formData.name]);

  const handleSubmit = (e) => {
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

  return (
    <Fragment>
      <form onSubmit={handleSubmit}>
        <input style={{ display: 'none' }} type="submit" />
        <Stack horizontal styles={wizardStyles.stackinput} tokens={{ childrenGap: '2rem' }}>
          <StackItem grow={0} styles={wizardStyles.halfstack}>
            <TextField
              data-testid="NewDialogName"
              errorMessage={formDataErrors.name}
              label={formatMessage('Name')}
              onChange={updateForm('name')}
              styles={name}
              value={formData.name}
            />
          </StackItem>
          <StackItem grow={0} styles={wizardStyles.halfstack}>
            <TextField
              label={formatMessage('Description')}
              multiline
              onChange={updateForm('description')}
              resizable={false}
              styles={description}
              value={formData.description}
            />
          </StackItem>
        </Stack>
        <LocationSelectContent onCurrentPathUpdate={onCurrentPathUpdate} operationMode={{ read: true, write: true }} />

        <DialogFooter>
          <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
          <PrimaryButton disabled={disable} onClick={handleSubmit} text={formatMessage('Next')} />
        </DialogFooter>
      </form>
    </Fragment>
  );
};
