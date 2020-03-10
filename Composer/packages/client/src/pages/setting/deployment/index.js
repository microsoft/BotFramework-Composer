// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState, Fragment } from 'react';
import formatMessage from 'format-message';
import { DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { DeployWizard } from './deployWizard.js';
import { styles } from './styles';

const instructions = {
  title: formatMessage('Deploy your bot to Azure'),
  description: formatMessage(
    'For team members or customers to interact with this bot, your bot needs to be deployed. In this version of Composer, this step is not yet automated, however, Composer can configure Azure Resources and generate a script to deploy your bot. You can use this script whenever you want to deploy an updated version of your bot.'
  ),
  button1: formatMessage('Create Azure Resources'),
  button2: formatMessage('Deploy Bot to Azure'),
  helpLink: 'https://aka.ms/bfc-publishing-your-bot',
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
        <div style={styles.header}>{instructions.title}</div>
        <p>{instructions.description}</p>
        <Stack horizontal gap="2rem" styles={{ root: { marginBottom: '1rem' } }}>
          <DefaultButton onClick={openWizardCreate} text={instructions.button1} />
          <DefaultButton onClick={openWizardDeploy} text={instructions.button2} />
        </Stack>
        <Link href={instructions.helpLink} rel="noopener noreferrer" target="_blank">
          {formatMessage('Learn more')}
        </Link>
        <DeployWizard isOpen={wizardOpen} initialStep={step} closeModal={closeWizard} />
      </div>
    </Fragment>
  );
};
