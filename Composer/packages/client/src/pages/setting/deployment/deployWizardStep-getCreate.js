import React, { Fragment } from 'react';
import formatMessage from 'format-message';
import { Stack, DialogFooter, PrimaryButton, DefaultButton, StackItem, TextField } from 'office-ui-fabric-react';

import { styles } from './styles';
import processGif from './deploy-create-output.gif';

export const DeployWizardStep2 = props => {
  const { nextStep, closeModal, botValues } = props;

  const scriptValue = [
    `cd ${botValues.location}`,
    `pwsh ./Scripts/create.ps1 -name ${botValues.name} -environment ${botValues.environment} -location ${
      botValues.region.key
    } -appPassword '${botValues.secret}'`,
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
            styles={styles.input}
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
            alt={formatMessage('Animation showing the command line tool output')}
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
