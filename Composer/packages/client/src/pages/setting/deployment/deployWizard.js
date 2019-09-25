import React, { Fragment, useState, useEffect } from 'react';
import formatMessage from 'format-message';
import { Dialog, DialogType } from 'office-ui-fabric-react';

import { DeployWizardStepCreate } from './deployWizardStep-createDeploy';
import { DeployWizardStepDeploy } from './deployWizardStep-deployOnly';
import { DeployWizardStep2 } from './deployWizardStep-getCreate';
import { DeployWizardStep3 } from './deployWizardStep-getDeploy';
import { styles } from './styles';

export const DeployWizard = props => {
  const { isOpen, closeModal, initialStep } = props;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [botValues, setBotValues] = useState();

  // update the step if it is changed externally
  useEffect(() => {
    setCurrentStep(initialStep);
  }, [initialStep]);

  const completeStep1 = form => {
    setBotValues(form);
    setCurrentStep(2);
  };

  const completeStep2 = () => {
    setCurrentStep(3);
  };

  const resetModal = () => {
    setCurrentStep(0);
    closeModal();
  };

  const steps = [
    {
      title: formatMessage('Set bot name and password'),
      subText: 'Make sure to sign in to the Azure Portal or create an account',
      children: <DeployWizardStepCreate nextStep={completeStep1} closeModal={resetModal} />,
    },
    {
      title: formatMessage('Set bot name and password'),
      subText: 'Make sure to sign in to the Azure Portal or create an account',
      children: <DeployWizardStepDeploy nextStep={completeStep1} closeModal={resetModal} />,
    },
    {
      title: formatMessage('Create Azure Resources'),
      subText: 'The first step to deploying your bot is creating all the necessary Azure resources.',
      children: <DeployWizardStep2 botValues={botValues} nextStep={completeStep2} closeModal={resetModal} />,
    },
    {
      title: formatMessage('Deploy your Bot'),
      subText:
        'Deploy your bot code and Composer assets to Azure using the command below. Run this any time you want to update your bot on Azure.',
      children: <DeployWizardStep3 botValues={botValues} closeModal={resetModal} />,
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
