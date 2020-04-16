// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { Fragment } from 'react';
import formatMessage from 'format-message';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { TextField } from 'office-ui-fabric-react/lib/TextField';

import { styles } from './styles';
import processGif from './deploy-deploy-output.png';

export const DeployWizardStep3 = (props) => {
  const { closeModal, botValues } = props;

  const scriptValue = [
    `cd ${botValues.location}`,
    `pwsh ./Scripts/deploy.ps1 -name ${botValues.name} -environment ${botValues.environment}`,
  ].join('\n');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptValue);
  };

  return (
    <Fragment>
      <Stack gap="2rem" horizontal styles={styles.stackinput}>
        <StackItem grow={1} styles={styles.halfstack}>
          <TextField
            autoFocus
            label={formatMessage('Publish Bot Script')}
            multiline
            readOnly
            styles={styles.textarea}
            value={scriptValue}
          />
          <PrimaryButton onClick={copyToClipboard} text={formatMessage('Copy to Clipboard')} />
        </StackItem>
        <StackItem align="end" grow={1} styles={styles.halfstack}>
          {/* <p>{formatMessage('This is the name that your user will see.')}</p> */}
        </StackItem>
      </Stack>
      <Stack gap="2rem" horizontal styles={styles.stackinput}>
        <StackItem grow={1}>
          <p>
            {formatMessage(
              'Copy the commands above, and paste them into your terminal.  The output will look like the screenshot below. Note that it may take several minutes for the publish to complete.'
            )}
          </p>
          <img
            alt={formatMessage('This image shows the command line tool output')}
            src={processGif}
            style={styles.gif}
          />
        </StackItem>
      </Stack>
      <DialogFooter>
        <PrimaryButton onClick={closeModal} text={formatMessage('Done')} />
      </DialogFooter>
    </Fragment>
  );
};
