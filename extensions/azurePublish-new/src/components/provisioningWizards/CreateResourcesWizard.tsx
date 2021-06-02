// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';

import { Wizard } from '../shared/wizard/Wizard';

import { CreateActionContentStep } from './steps/CreateActionContentStep';
import { AddResourcesStep } from './steps/AddResourcesStep';
import { ResourceConfigurationStep } from './steps/ResourceConfigurationStep';
import { ReviewResourcesStep } from './steps/ReviewResourcesStep';

export const CreateResourcesWizard = ({ onStepChange }) => {
  //TODO: maintain step validation state here
  const [isValidResourceConfiguration, setIsValidResourceConfiguration] = useState<boolean>(false);

  return (
    <Wizard onStepChange={onStepChange}>
      <Wizard.Steps>
        <Wizard.Step key="Create new resources" showUserInfo title="Create new resources">
          <CreateActionContentStep />
          <Wizard.Footer />
        </Wizard.Step>
        <Wizard.Step key="Configure resources" showUserInfo title="Configure resources">
          <ResourceConfigurationStep onResourceConfigurationChange={setIsValidResourceConfiguration} />
          <Wizard.Footer canProceedToNext={isValidResourceConfiguration} />
        </Wizard.Step>
        <Wizard.Step key="Add resources" showUserInfo title="Add resources">
          <AddResourcesStep />
          <Wizard.Footer />
        </Wizard.Step>
        <Wizard.Step key="Review resources to be created" showUserInfo title="Review resources to be created">
          <ReviewResourcesStep />
          <Wizard.Footer />
        </Wizard.Step>
      </Wizard.Steps>
    </Wizard>
  );
};
