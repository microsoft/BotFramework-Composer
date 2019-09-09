import React, { useState, Fragment } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton } from 'office-ui-fabric-react';

import { DeployWizard } from './deployWizard.js';

const instructions = {
  title: formatMessage('How to deploy your bot to Azure'),
  description: formatMessage(
    'For team members or customers to interact with ToDoBot, your bot needs to be deployed. In this version of Composer, this step is not yet automated, however, Composer can configure Azure Resources and generate a script to deploy your bot. You can use this script whenever you want to deploy an updated version of your bot.'
  ),
  button: formatMessage('Get Deploy Script'),
};

export const Deployment = props => {
  props;
  const [wizardOpen, setWizardOpen] = useState(false);

  const openWizard = () => {
    setWizardOpen(true);
  };

  const closeWizard = () => {
    setWizardOpen(false);
  };

  return (
    <Fragment>
      <h1>{instructions.title}</h1>
      <p>{instructions.description}</p>
      <PrimaryButton onClick={openWizard} text={instructions.button} />
      <DeployWizard isOpen={wizardOpen} closeModal={closeWizard} />
    </Fragment>
  );
};
