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
import React, { Fragment, useContext, useState } from 'react';
import formatMessage from 'format-message';
import {
  Stack,
  // Dropdown,
  ComboBox,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  StackItem,
  TextField,
} from 'office-ui-fabric-react';

import { StoreContext } from '../../../store';

import { validateEnvironment, validateName, validateRegion, validateSecret } from './validators';
import { styles } from './styles';
// TODO: verify that this is the correct/complete list of azure regions
// https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.documents.locationnames?view=azure-dotnet
import { regionOptions } from './luisRegions.js';

export const DeployWizardStepCreate = props => {
  const { nextStep, closeModal } = props;
  const { state } = useContext(StoreContext);
  const { botName, location } = state;
  const [disable, setDisable] = useState(false);
  const [formData, setFormData] = useState({
    name: botName,
    location: location,
    secret: '',
    environment: '',
    region: regionOptions[0].key,
    errors: {},
  });

  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      errors: {},
      [field]: newValue,
    });
    setDisable(false);
  };

  const validateForm = () => {
    const errors = {};

    if (validateSecret(formData.secret) !== true) {
      errors.secret = validateSecret(formData.secret);
    }
    if (validateName(formData.name) !== true) {
      errors.name = validateName(formData.name);
    }
    if (validateEnvironment(formData.environment) !== true) {
      errors.environment = validateEnvironment(formData.environment);
    }
    if (validateRegion(formData.region) !== true) {
      errors.region = validateRegion(formData.region);
    }

    setFormData({
      ...formData,
      errors,
    });

    if (Object.keys(errors).length) {
      setDisable(true);
      return false;
    }
    setDisable(false);
    return true;
  };

  const submit = e => {
    e.preventDefault();
    if (validateForm()) {
      nextStep(formData);
    }
  };

  return (
    <Fragment>
      <form onSubmit={submit}>
        <Stack horizontal gap="2rem" styles={styles.stackinput}>
          <StackItem grow={1} styles={styles.halfstack}>
            <TextField
              label={formatMessage('Bot Display Name')}
              styles={styles.input}
              defaultValue={botName}
              onChange={updateForm('name')}
              errorMessage={formData.errors.name}
              data-testid="displayname"
              required
            />
          </StackItem>
          <StackItem align="end" grow={1} styles={styles.halfstack}>
            <p>{formatMessage('This is the name that your user will see.')}</p>
          </StackItem>
        </Stack>
        <Stack horizontal gap="2rem" styles={styles.stackinput}>
          <StackItem grow={1} styles={styles.halfstack}>
            <TextField
              label={formatMessage('Environment Name')}
              styles={styles.input}
              onChange={updateForm('environment')}
              errorMessage={formData.errors.environment}
              data-testid="displayname"
              required
            />
          </StackItem>
          <StackItem align="end" grow={1} styles={styles.halfstack}>
            <p>{formatMessage('A name for this instance of your bot on Azure. (Staging, Production, testing, etc)')}</p>
          </StackItem>
        </Stack>
        <Stack horizontal gap="2rem" styles={styles.stackinput}>
          <StackItem grow={1} styles={styles.halfstack}>
            <TextField
              label={formatMessage('App Secret')}
              styles={styles.input}
              mask="****************"
              onChange={updateForm('secret')}
              errorMessage={formData.errors.secret}
              data-testid="appsecret"
              required
              autoComplete={false}
              maxLength={16}
            />
          </StackItem>
          <StackItem align="end" grow={1} styles={styles.halfstack}>
            <p>
              {formatMessage(
                'A 16-character secret used to securely identify and validate your bot. Must include at least 1 number and 1 special character.'
              )}
            </p>
          </StackItem>
        </Stack>

        <Stack horizontal gap="2rem" styles={styles.stackinput}>
          <StackItem grow={1} styles={styles.halfstack}>
            <ComboBox
              label={formatMessage('Azure Region')}
              styles={styles.input}
              options={regionOptions}
              onChange={updateForm('region')}
              errorMessage={formData.errors.region}
              data-testid="region"
              required
              autoComplete={'on'}
            />
          </StackItem>
          <StackItem align="end" grow={1} styles={styles.halfstack}>
            <p>{formatMessage('Choose an Azure region for your resources to be located in')}</p>
          </StackItem>
        </Stack>

        <DialogFooter>
          <DefaultButton onClick={closeModal} text={formatMessage('Cancel')} />
          <PrimaryButton onClick={submit} text={formatMessage('Next')} disabled={disable} />
        </DialogFooter>
      </form>
    </Fragment>
  );
};
