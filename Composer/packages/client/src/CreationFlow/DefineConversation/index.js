/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
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
