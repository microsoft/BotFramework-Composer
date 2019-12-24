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
import { StoreContext } from '../../store';
import { StorageFolder } from '../../store/types';

import { name, description } from './styles';
const MAXTRYTIMES = 10000;

interface FormData {
  name: string;
  description: string;
  location: string;
}

interface FormDataError {
  name?: string;
}

interface Bots {
  name: '';
  path: '';
}

interface DefineConversationProps {
  onSubmit: (formData: FormData) => void;
  onDismiss: () => void;
  onCurrentPathUpdate?: (newPath?: string, storageId?: string) => void;
  onGetErrorMessage?: (text: string) => void;
  enableLocationBrowse: boolean;
  focusedStorageFolder?: StorageFolder;
  currentPath?: string;
  bots?: Bots[];
  shouldPresetName: boolean;
}

const initialFormDataError: FormDataError = {};

export const DefineConversation: React.FC<DefineConversationProps> = props => {
  const {
    onSubmit,
    onDismiss,
    onCurrentPathUpdate,
    enableLocationBrowse,
    focusedStorageFolder,
    currentPath,
    bots,
    shouldPresetName,
  } = props;
  const { state } = useContext(StoreContext);
  const { templateId } = state;

  const getDefaultName = () => {
    if (!shouldPresetName) {
      return '';
    }
    let i = -1;
    const bot = templateId;
    let defaultName = '';
    do {
      i++;
      defaultName = `${bot}-${i}`;
    } while (
      bots &&
      bots.find(bot => {
        return bot.name === defaultName;
      }) &&
      i < MAXTRYTIMES
    );
    return defaultName;
  };

  const initalFormData: FormData = { name: getDefaultName(), description: '', location: '' };
  const [formData, setFormData] = useState(initalFormData);
  const [formDataErrors, setFormDataErrors] = useState(initialFormDataError);
  const [disable, setDisable] = useState(false);
  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue,
    });
  };

  const nameRegex = /^[a-zA-Z0-9-_.]+$/;
  const validateForm = (data: FormData) => {
    const errors: FormDataError = {};
    const { name } = data;

    if (name && !nameRegex.test(name)) {
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
      bots &&
      bots.find(bot => {
        return bot.path === newBotPath;
      })
    ) {
      errors.name = formatMessage('Duplication of names');
    }
    return errors;
  };

  const isEmptyName = (name: string) => {
    if (!name) {
      return { name: 'Please input a name' };
    }
    return {};
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
    let errors = validateForm(formData);
    errors = isEmptyName(formData.name);
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
        {enableLocationBrowse && focusedStorageFolder && onCurrentPathUpdate && currentPath && (
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
};
