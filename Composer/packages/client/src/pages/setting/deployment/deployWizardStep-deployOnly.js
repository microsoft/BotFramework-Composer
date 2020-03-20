// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import React, { Fragment, useContext, useCallback, useEffect, useRef, useState } from 'react';
import formatMessage from 'format-message';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { StoreContext } from '../../../store';

import { validateEnvironment, validateName } from './validators';
import { styles } from './styles';
// TODO: get a complete list of azure regions
// TODO: verify that this is the correct/complete list of azure regions
// https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.documents.locationnames?view=azure-dotnet
import { regionOptions } from './luisRegions.js';

export const DeployWizardStepDeploy = props => {
  const { nextStep, closeModal } = props;
  const { state } = useContext(StoreContext);
  const { botName, projectId } = state;
  const [disable, setDisable] = useState(false);
  const [formData, setFormData] = useState({
    name: botName,
    location: path.join(process.env.LOCAL_PUBLISH_PATH, projectId).replace(/\\/g, '/'), // use plugin localtion to support deployment,
    secret: '',
    environment: '',
    region: regionOptions[0].key,
    errors: {},
  });

  const nameRef = useRef(null);
  const focusNameRef = () => nameRef.current.focus();
  const environmentRef = useRef(null);
  const focusEnvironmentRef = () => focusEnvironmentRef.current.focus();

  useEffect(() => {
    if (!formData.name || !formData.environment) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }, [formData.name, formData.environment]);

  const nextEnabled = () => {
    if (Object.keys(formData.errors).length || !formData.name || !formData.environment) {
      setDisable(true);
      return false;
    }
    setDisable(false);
    return true;
  };

  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      errors: {},
      [field]: newValue,
    });
  };

  const setEnvironmentErrors = () => {
    let environmentError;
    if (validateEnvironment(formData.environment) !== true) {
      environmentError = validateEnvironment(formData.environment);
    }
    if (environmentError) {
      setFormData({
        ...formData,
        errors: {
          ...formData.errors,
          environment: environmentError,
        },
      });
    }

    return nextEnabled();
  };

  const setNameErrors = () => {
    let nameError;
    if (validateName(formData.name) !== true) {
      nameError = validateName(formData.name);
    }
    if (nameError) {
      setFormData({
        ...formData,
        errors: {
          ...formData.errors,
          name: nameError,
        },
      });
    }
    return nextEnabled();
  };

  const validateForm = () => {
    const nameErrors = setNameErrors();

    const environmentErrors = setEnvironmentErrors();

    return nameErrors && environmentErrors;
  };

  const submit = e => {
    e.preventDefault();

    if (validateForm()) {
      nextStep(formData);
    } else {
      if (formData.errors.name) {
        focusNameRef();
      } else if (formData.errors.environment) {
        focusEnvironmentRef();
      }
    }
  };

  return (
    <Fragment>
      <form onSubmit={submit}>
        <Stack horizontal gap="2rem" styles={styles.stackinput}>
          <StackItem grow={1} styles={styles.halfstack}>
            <TextField
              autoFocus={true}
              label={formatMessage('Bot Display Name')}
              styles={styles.input}
              defaultValue={botName}
              onBlur={useCallback(() => setNameErrors())}
              onChange={updateForm('name')}
              errorMessage={formData.errors.name}
              data-testid="displayname"
              componentRef={nameRef}
              required
              aria-required
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
              onBlur={useCallback(() => setEnvironmentErrors())}
              onChange={updateForm('environment')}
              errorMessage={formData.errors.environment}
              data-testid="displayname"
              componentRef={environmentRef}
              required
              aria-required
            />
          </StackItem>
          <StackItem align="end" grow={1} styles={styles.halfstack}>
            <p>{formatMessage('A name for this instance of your bot on Azure. (Staging, Production, testing, etc)')}</p>
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
