// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import path from 'path';

import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
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

  const nameRef = useRef(null);
  const focusNameRef = () => nameRef.current.focus();
  const environmentRef = useRef(null);
  const focusEnvironmentRef = () => environmentRef.current.focus();
  const appSecretRef = useRef(null);
  const focusAppSecretRef = () => appSecretRef.current.focus();
  const regionRef = useRef(null);
  const focusRegionRef = () => regionRef.current.focus();

  useEffect(() => {
    if (!formData.name || !formData.environment || !formData.secret || !formData.region) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }, [formData.name, formData.environment, formData.appSecretRef, formData.region]);

  const nextEnabled = () => {
    if (
      Object.keys(formData.errors).length ||
      !formData.name ||
      !formData.environment ||
      !formData.secret ||
      !Object.keys(formData.region).length
    ) {
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
    setDisable(false);
  };

  const setAppSecretErrors = () => {
    let appSecretErrors;
    if (validateSecret(formData.secret) !== true) {
      appSecretErrors = validateSecret(formData.secret);
    }
    if (appSecretErrors) {
      setFormData({
        ...formData,
        errors: {
          ...formData.errors,
          secret: appSecretErrors,
        },
      });
    }

    return nextEnabled();
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

  const setRegionErrors = () => {
    let regionError;
    if (validateName(formData.region) !== true) {
      regionError = validateRegion(formData.region);
    }
    if (regionError) {
      setFormData({
        ...formData,
        errors: {
          ...formData.errors,
          region: regionError,
        },
      });
    }
    return nextEnabled();
  };

  const validateForm = () => {
    const nameErrors = setNameErrors();

    const environmentErrors = setEnvironmentErrors();

    const appSecretErrors = setAppSecretErrors();

    const regionErrors = setRegionErrors();

    return nameErrors && environmentErrors && appSecretErrors && regionErrors;
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
      } else if (formData.errors.secret) {
        focusAppSecretRef();
      } else {
        focusRegionRef();
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
        <Stack horizontal gap="2rem" styles={styles.stackinput}>
          <StackItem grow={1} styles={styles.halfstack}>
            <TextField
              label={formatMessage('App Secret')}
              styles={styles.input}
              mask="****************"
              onBlur={useCallback(() => setAppSecretErrors())}
              onChange={updateForm('secret')}
              errorMessage={formData.errors.secret}
              data-testid="appsecret"
              componentRef={appSecretRef}
              required
              aria-required
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
              onBlur={useCallback(() => setRegionErrors())}
              onChange={updateForm('region')}
              errorMessage={formData.errors.region}
              data-testid="region"
              componentRef={regionRef}
              required
              aria-required
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
