// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment } from 'react';
import { useContext } from 'react';
import formatMessage from 'format-message';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { StoreContext } from '../../../store';

import { styles } from './styles';
import processGif from './deploy-create-output.png';

export const DeployWizardStep2 = props => {
  const { state } = useContext(StoreContext);
  const { settings } = state;
  const { nextStep, closeModal, botValues } = props;
  const luisAuthoringKey = settings.luis && settings.luis.authoringKey ? settings.luis.authoringKey : undefined;
  const scriptValue = [
    `cd ${botValues.location}`,
    `pwsh ./Scripts/create.ps1 -name ${botValues.name} -environment ${botValues.environment} -location ${
      botValues.region.key
    } -appPassword '${botValues.secret}' ${luisAuthoringKey ? '-luisAuthoringKey ' + luisAuthoringKey : ''}`,
  ].join('\n');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptValue);
  };

  return (
    <Fragment>
      <Stack horizontal gap="2rem" styles={styles.stackinput}>
        <StackItem grow={1} styles={styles.halfstack}>
          <TextField
            label={formatMessage('Create Resources Script')}
            styles={styles.textarea}
            value={scriptValue}
            readOnly={true}
            multiline={true}
          />
          <PrimaryButton text={formatMessage('Copy to Clipboard')} onClick={copyToClipboard} />
        </StackItem>
        <StackItem align="end" grow={1} styles={styles.halfstack}>
          {/* <p>{formatMessage('This is the name that your user will see.')}</p> */}
        </StackItem>
      </Stack>
      <Stack horizontal gap="2rem" styles={styles.stackinput}>
        <StackItem grow={1}>
          <p>
            {formatMessage(
              'Copy the commands above, and paste them into your terminal.  The output will look like the screenshot below. Note that it will take > 5 minutes for the provisioning process to complete.'
            )}
          </p>
          <img
            style={styles.gif}
            src={processGif}
            alt={formatMessage('This image shows the command line tool output')}
          />
        </StackItem>
      </Stack>
      <DialogFooter>
        <DefaultButton onClick={closeModal} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={nextStep} text={formatMessage('Next')} />
      </DialogFooter>
    </Fragment>
  );
};
