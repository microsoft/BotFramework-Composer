import React, { Fragment } from 'react';
import formatMessage from 'format-message';
import { Stack, DialogFooter, PrimaryButton, DefaultButton, StackItem, TextField } from 'office-ui-fabric-react';

import { styles } from './styles';

export const DeployWizardStep2 = props => {
  const { nextStep, closeModal, botValues } = props;

  const scriptValue = [
    `cd project_folder`,
    `./scripts/create.ps1 --name=${botValues.name} --region=${botValues.region.key} --secret=${botValues.secret}`,
  ].join('\n');

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
          <PrimaryButton text={formatMessage('Copy to Clipboard')} />
        </StackItem>
        <StackItem align="end" grow={1} styles={styles.halfstack}>
          {/* <p>{formatMessage('This is the name that your user will see.')}</p> */}
        </StackItem>
      </Stack>
      <Stack horizontal gap="2rem" styles={styles.stackinput}>
        <StackItem grow={1} styles={styles.halfstack}>
          This is where the GIF goes.
        </StackItem>
        <StackItem align="end" grow={1} styles={styles.halfstack} />
      </Stack>
      <DialogFooter>
        <DefaultButton onClick={closeModal} text={formatMessage('Cancel')} />
        <PrimaryButton onClick={nextStep} text={formatMessage('Next')} />
      </DialogFooter>
    </Fragment>
  );
};
