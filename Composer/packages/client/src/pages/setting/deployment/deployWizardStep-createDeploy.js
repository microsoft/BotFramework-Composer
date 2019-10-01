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

  // todo: disable the next button until its valid
  // todo: do not autocomplete app secret
  const validateForm = () => {
    const errors = {};

    if (validateSecret(formData.secret) !== true) {
      errors.secret = validateSecret(formData.secret);
    }
    if (validateName(formData.name) !== true) {
      errors.name = validateName(formData.name);
    }
    if (validateEnvironment(formData.environment) !== true) {
      errors.environment = validateName(formData.environment);
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

  const validateName = name => {
    if (name.length === 0) {
      return formatMessage('Bot name is a required field');
    }
    return true;
  };

  const validateEnvironment = name => {
    if (name.length === 0) {
      return formatMessage('Environment name is a required field');
    }
    return true;
  };

  const validateRegion = region => {
    if (!region || !region.key) {
      return formatMessage('Azure region is a required field');
    }
    if (
      regionOptions.filter(r => {
        return r.key === region.key;
      }).length === 0
    ) {
      return formatMessage('Select an Azure region from the list');
    }
    return true;
  };

  // 16 characters at least one special char
  const validateSecret = val => {
    if (val.length !== 16) {
      return formatMessage('App secret must be exactly 16 characters long');
    }
    if (!val.match(/[a-z]/i)) {
      return formatMessage('App secret must contain at least 1 alpha character');
    }
    if (!val.match(/[0-9]/)) {
      return formatMessage('App secret must contain at least 1 number');
    }
    // eslint-disable-next-line no-useless-escape
    if (!val.match(/[!@$%^&#\?\.\+\*_\-\(\)\[\]]/)) {
      return formatMessage('App secret must contain at least 1 special character');
    }

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
