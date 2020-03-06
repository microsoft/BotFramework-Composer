// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import React, { Fragment, useContext, useState } from 'react';
import formatMessage from 'format-message';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ComboBox } from 'office-ui-fabric-react/lib/ComboBox';

import { StoreContext } from '../../../store';

import { validateEnvironment, validateName, validateRegion, validateSecret } from './validators';
import { styles } from './styles';
// TODO: verify that this is the correct/complete list of azure regions
// https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.documents.locationnames?view=azure-dotnet
import { regionOptions } from './luisRegions.js';

export const DeployWizardStepCreate = props => {
  const { nextStep, closeModal } = props;
  const { state } = useContext(StoreContext);
  const { botName, projectId } = state;
  const [disable, setDisable] = useState(false);

  const [formData, setFormData] = useState({
    name: botName,
    location: path.join(process.env.LOCAL_PUBLISH_PATH, projectId).replace(/\\/g, '/'), // use plugin localtion to support deployment
    secret: '',
    environment: '',
    region: regionOptions[0],
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
              autoComplete={'off'}
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
              defaultSelectedKey={regionOptions[0].key}
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
