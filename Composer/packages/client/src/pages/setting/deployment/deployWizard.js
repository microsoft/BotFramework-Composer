import React, { Fragment, useState } from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogType } from 'office-ui-fabric-react';

import { DeployWizardStep1 } from './deployWizardStep1.js';
import { DeployWizardStep2 } from './deployWizardStep2.js';
import { styles } from './styles';

export const DeployWizard = props => {
  const { isOpen, closeModal } = props;
  const [currentStep, setCurrentStep] = useState(0);
  const [botValues, setBotValues] = useState();

  const completeStep1 = form => {
    console.log('Got form data', form);
    setBotValues(form);
    setCurrentStep(1);
  };

  const completeStep2 = () => {};

  const steps = [
    {
      title: formatMessage('Set bot name and password'),
      subText: 'Make sure to sign in to the Azure Portal or create an account',
      children: <DeployWizardStep1 nextStep={completeStep1} closeModal={closeModal} />,
    },
    {
      title: formatMessage('Create Azure Resources'),
      subText: 'The first step to deploying your bot is creating all the necessary azure resoures.',
      children: <DeployWizardStep2 botValues={botValues} nextStep={completeStep2} closeModal={closeModal} />,
    },
  ];

  return (
    <Fragment>
      <Dialog
        hidden={!isOpen}
        onDismiss={closeModal}
        dialogContentProps={{
          type: DialogType.normal,
          title: steps[currentStep].title,
          subText: steps[currentStep].subText,
          styles: styles.dialog,
        }}
        modalProps={{
          isBlocking: false,
          styles: styles.modal,
        }}
      >
        {steps[currentStep].children}
      </Dialog>
    </Fragment>
  );
};
