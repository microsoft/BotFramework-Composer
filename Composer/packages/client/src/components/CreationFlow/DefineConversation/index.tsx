// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

//TODO: Remove Path module
import Path from 'path';

import get from 'lodash/get';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import React, { useState, Fragment, useEffect } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { RouteComponentProps } from '@reach/router';
import querystring from 'query-string';

import { DialogCreationCopy } from '../../../constants';
import { DialogWrapper } from '../../DialogWrapper';
import { DialogTypes } from '../../DialogWrapper/styles';
import { LocationSelectContent } from '../LocationBrowser/LocationSelectContent';
import { StorageFolder } from '../../../store/types';

import { name, description, halfstack, stackinput } from './styles';
const MAXTRYTIMES = 10000;

interface FormData {
  name: string;
  description: string;
  schemaUrl: string;
}

interface FormDataError {
  name?: string;
}

interface DefineConversationProps
  extends RouteComponentProps<{
    templateId: string;
    location: string;
  }> {
  onSubmit: (formData: FormData) => void;
  onDismiss: () => void;
  onCurrentPathUpdate: (newPath?: string, storageId?: string) => void;
  onGetErrorMessage?: (text: string) => void;
  saveTemplateId?: (templateId: string) => void;
  focusedStorageFolder: StorageFolder;
}

const initialFormDataError: FormDataError = {};

const DefineConversation: React.FC<DefineConversationProps> = (props) => {
  const { onSubmit, onDismiss, onCurrentPathUpdate, saveTemplateId, templateId, focusedStorageFolder } = props;
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

  const initalFormData: FormData = { name: '', description: '', schemaUrl: '' };
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
    if (formData.name) {
      const errors = validateForm(formData);
      if (Object.keys(errors).length || !focusedStorageFolder.writable) {
        setDisable(true);
      } else {
        setDisable(false);
      }
      setFormDataErrors(errors);
    }
  }, [focusedStorageFolder, formData.name]);

  useEffect(() => {
    if (saveTemplateId && templateId) {
      saveTemplateId(templateId);
    }
  });

  useEffect(() => {
    const formData: FormData = { name: getDefaultName(), description: '', schemaUrl: '' };
    setFormData(formData);
    if (props.location && props.location.search) {
      const updatedFormData = {
        ...formData,
      };

      const decoded = decodeURIComponent(props.location.search);
      const { name, description, schemaUrl } = querystring.parse(decoded);
      if (description) {
        updatedFormData.description = description as string;
      }

      if (schemaUrl) {
        updatedFormData.schemaUrl = schemaUrl as string;
      }

      if (name) {
        updatedFormData.name = name as string;
      } else {
        updatedFormData.name = getDefaultName();
      }
      setFormData(updatedFormData);
    }
  }, [templateId]);

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
      <DialogWrapper
        isOpen
        {...DialogCreationCopy.DEFINE_CONVERSATION_OBJECTIVE}
        dialogType={DialogTypes.CreateFlow}
        onDismiss={onDismiss}
      >
        <form onSubmit={handleSubmit}>
          <input style={{ display: 'none' }} type="submit" />
          <Stack horizontal styles={stackinput} tokens={{ childrenGap: '2rem' }}>
            <StackItem grow={0} styles={halfstack}>
              <TextField
                autoFocus
                data-testid="NewDialogName"
                errorMessage={formDataErrors.name}
                label={formatMessage('Name')}
                onChange={updateForm('name')}
                required
                styles={name}
                value={formData.name}
              />
            </StackItem>
            <StackItem grow={0} styles={halfstack}>
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
          <LocationSelectContent
            focusedStorageFolder={focusedStorageFolder}
            onCurrentPathUpdate={onCurrentPathUpdate}
            operationMode={{ read: true, write: true }}
          />

          <DialogFooter>
            <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
            <PrimaryButton
              data-testid="SubmitNewBotBtn"
              disabled={disable}
              onClick={handleSubmit}
              text={formatMessage('Next')}
            />
          </DialogFooter>
        </form>
      </DialogWrapper>
    </Fragment>
  );
};

export default DefineConversation;
