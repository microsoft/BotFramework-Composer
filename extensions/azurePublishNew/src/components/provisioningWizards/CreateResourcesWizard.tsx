// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { RecoilRoot } from 'recoil';

import { Wizard } from '../shared/wizard/Wizard';

import { CreateActionContentStep, ChooseResourcesStep, ResourceConfigurationStep, ReviewResourcesStep } from './steps';

export const CreateResourcesWizard = ({ onStepChange, stepId }) => {
  const [isValidResourceConfiguration, setIsValidResourceConfiguration] = useState<boolean>(false);
  console.log(stepId);
  return (
    <Wizard stepIndex={stepId} onStepChange={onStepChange}>
      <Wizard.Steps>
        <Wizard.Step key="Create new resources">
          <CreateActionContentStep />
          <Wizard.Footer />
        </Wizard.Step>
        <Wizard.Step key="Configure resources">
          <ResourceConfigurationStep onResourceConfigurationChange={setIsValidResourceConfiguration} />
          <Wizard.Footer canProceedToNext={isValidResourceConfiguration} />
        </Wizard.Step>
        <Wizard.Step key="Add resources">
          <ChooseResourcesStep />
          <Wizard.Footer />
        </Wizard.Step>
        <Wizard.Step key="Review resources to be created">
          <ReviewResourcesStep />
          <Wizard.Footer />
        </Wizard.Step>
      </Wizard.Steps>
    </Wizard>
  );
};
