import React, { Fragment } from 'react';
import formatMessage from 'format-message';
import { Stack, StackItem, TextField } from 'office-ui-fabric-react';

import { styles as wizardStyles } from '../StepWizard/styles';

import { name, description } from './styles';

export function DialogModal(props) {
  const { horizontal, formData, updateForm, getErrorMessage } = props;

  return (
    <Fragment>
      <input type="submit" style={{ display: 'none' }} />
      <Stack horizontal={horizontal} gap="2rem" styles={wizardStyles.stackinput}>
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
    </Fragment>
  );
}
