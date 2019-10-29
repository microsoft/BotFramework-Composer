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

  const completeStepCreate = form => {
    setBotValues(form);
    setCurrentStep(2);
  };

  const completeStepDeploy = form => {
    setBotValues(form);
    setCurrentStep(3);
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
      children: <DeployWizardStepCreate nextStep={completeStepCreate} closeModal={resetModal} />,
    },
    {
      title: formatMessage('Set bot name and password'),
      subText: 'Make sure to sign in to the Azure Portal or create an account',
      children: <DeployWizardStepDeploy nextStep={completeStepDeploy} closeModal={resetModal} />,
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
