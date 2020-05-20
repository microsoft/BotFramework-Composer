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
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';

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
  isFormDialog: number;
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

const DefineConversation: React.FC<DefineConversationProps> = props => {
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
      files.find(file => {
        return file.name.toLowerCase() === defaultName.toLowerCase();
      }) &&
      i < MAXTRYTIMES
    );
    return defaultName;
  };

  const formDialogOptions: IDropdownOption[] = [
    {
      key: 0,
      text: 'false',
    },
    {
      key: 1,
      text: 'true',
    },
  ];

  const initalFormData: FormData = { name: '', description: '', schemaUrl: '', isFormDialog: 0 };
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
      files.find(bot => {
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
    const formData: FormData = { name: getDefaultName(), description: '', schemaUrl: '', isFormDialog: 0 };
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
  return (
    <Fragment>
      <DialogWrapper
        isOpen={true}
        {...DialogCreationCopy.DEFINE_CONVERSATION_OBJECTIVE}
        onDismiss={onDismiss}
        dialogType={DialogTypes.CreateFlow}
      >
        <form onSubmit={handleSubmit}>
          <input type="submit" style={{ display: 'none' }} />
          <Stack horizontal={true} tokens={{ childrenGap: '2rem' }} styles={stackinput}>
            <StackItem grow={0} styles={halfstack}>
              <TextField
                label={formatMessage('Name')}
                value={formData.name}
                styles={name}
                onChange={updateForm('name')}
                errorMessage={formDataErrors.name}
                data-testid="NewDialogName"
                required
                autoFocus
              />
            </StackItem>
            <StackItem grow={0} styles={halfstack}>
              <Dropdown
                label={formatMessage('Is form dialog?')}
                options={formDialogOptions}
                onChange={updateForm('isFormDialog')}
                data-testid={'isFormDialogDropDown'}
                defaultSelectedKey={formData.isFormDialog}
              />
            </StackItem>
            <StackItem grow={0} styles={halfstack}>
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
          <LocationSelectContent
            operationMode={{ read: true, write: true }}
            onCurrentPathUpdate={onCurrentPathUpdate}
            focusedStorageFolder={focusedStorageFolder}
          />

          <DialogFooter>
            <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
            <PrimaryButton
              onClick={handleSubmit}
              text={formatMessage('Next')}
              disabled={disable}
              data-testid="SubmitNewBotBtn"
            />
          </DialogFooter>
        </form>
      </DialogWrapper>
    </Fragment>
  );
};

export default DefineConversation;
