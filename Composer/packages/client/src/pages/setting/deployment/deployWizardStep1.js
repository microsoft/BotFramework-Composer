import React, { Fragment, useContext, useState } from 'react';
import formatMessage from 'format-message';
import {
  Stack,
  Dropdown,
  DialogFooter,
  PrimaryButton,
  DefaultButton,
  StackItem,
  TextField,
} from 'office-ui-fabric-react';

import { StoreContext } from '../../../store';

import { styles } from './styles';

// TODO: get a complete list of azure regions
const regionOptions = [{ key: 'westus', text: 'westus' }];

export const DeployWizardStep1 = props => {
  const { nextStep, closeModal } = props;
  const { state } = useContext(StoreContext);
  const { botName } = state;
  const [formData, setFormData] = useState({
    name: botName,
    secret: '',
    region: regionOptions[0].key,
    errors: {},
  });

  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      errors: {},
      [field]: newValue,
    });
  };

  const validateForm = () => {
    const errors = {};
    if (validateSecret(formData.secret) !== undefined) {
      errors.secret = validateSecret(formData.secret);
    }

    setFormData({
      ...formData,
      errors,
    });

    if (Object.keys(errors).length) {
      console.log('found some errors', errors);
      return false;
    }
    return true;
  };
  // TODO: enhance validation of secret value
  const validateSecret = val => {
    console.log('validate secret', val);
    setFormData({
      ...formData,
      errors: {},
    });
    if (val.length !== 16) {
      return formatMessage('App secret must be exactly 16 characters long');
    }
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
              // onGetErrorMessage={getErrorMessage}
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
              label={formatMessage('App Secret')}
              styles={styles.input}
              mask="****************"
              validateOnLoad={false}
              onChange={updateForm('secret')}
              errorMessage={formData.errors.secret}
              onGetErrorMessage={validateSecret}
              data-testid="appsecret"
              required
              maxLength={16}
            />
          </StackItem>
          <StackItem align="end" grow={1} styles={styles.halfstack}>
            <p>{formatMessage('A 16-character secret used to securely identify and validate your bot.')}</p>
          </StackItem>
        </Stack>

        <Stack horizontal gap="2rem" styles={styles.stackinput}>
          <StackItem grow={1} styles={styles.halfstack}>
            <Dropdown
              label={formatMessage('Azure Region')}
              styles={styles.input}
              options={regionOptions}
              onChange={updateForm('region')}
              errorMessage={formData.errors.region}
              data-testid="region"
              required
            />
          </StackItem>
          <StackItem align="end" grow={1} styles={styles.halfstack}>
            <p>{formatMessage('Choose an Azure region for your resources to be located in')}</p>
          </StackItem>
        </Stack>

        <DialogFooter>
          <DefaultButton onClick={closeModal} text={formatMessage('Cancel')} />
          <PrimaryButton onClick={submit} text={formatMessage('Next')} />
        </DialogFooter>
      </form>
    </Fragment>
  );
};
