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
import React, { useState, Fragment } from 'react';
import formatMessage from 'format-message';
import { DefaultButton, Stack } from 'office-ui-fabric-react';

import { DeployWizard } from './deployWizard.js';
import { styles } from './styles';

const instructions = {
  title: formatMessage('Deploy your bot to Azure'),
  description: formatMessage(
    'For team members or customers to interact with this bot, your bot needs to be deployed. In this version of Composer, this step is not yet automated, however, Composer can configure Azure Resources and generate a script to deploy your bot. You can use this script whenever you want to deploy an updated version of your bot.'
  ),
  button1: formatMessage('Create Azure Resources'),
  button2: formatMessage('Deploy Bot to Azure'),
};

export const Deployment = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(0);

  const openWizardCreate = () => {
    openWizard(0);
  };

  const openWizardDeploy = () => {
    openWizard(1);
  };

  const openWizard = initialStep => {
    setStep(initialStep);
    setWizardOpen(true);
  };

  const closeWizard = () => {
    setWizardOpen(false);
  };

  return (
    <Fragment>
      <div style={styles.page}>
        <h1 style={styles.header}>{instructions.title}</h1>
        <p>{instructions.description}</p>
        <Stack horizontal gap="2rem">
          <DefaultButton onClick={openWizardCreate} text={instructions.button1} />
          <DefaultButton onClick={openWizardDeploy} text={instructions.button2} />
        </Stack>
        <DeployWizard isOpen={wizardOpen} initialStep={step} closeModal={closeWizard} />
      </div>
    </Fragment>
  );
};
