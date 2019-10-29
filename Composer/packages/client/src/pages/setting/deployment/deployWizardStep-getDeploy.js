/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import React, { Fragment } from 'react';
import formatMessage from 'format-message';
import { Stack, DialogFooter, PrimaryButton, StackItem, TextField } from 'office-ui-fabric-react';

import { styles } from './styles';
import processGif from './deploy-deploy-output.gif';

export const DeployWizardStep3 = props => {
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
              'Copy the commands above, and paste them into your terminal.  The output will look like the screenshot below. Note that it may take several minutes for the deploy to complete.'
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
        <PrimaryButton onClick={closeModal} text={formatMessage('Done')} />
      </DialogFooter>
    </Fragment>
  );
};
