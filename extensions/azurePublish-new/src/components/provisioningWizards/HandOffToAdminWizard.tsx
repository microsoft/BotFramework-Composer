// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { Wizard } from '../shared/wizard/Wizard';

import { GenerateActionContentStep } from './steps/GenerateActionContentStep';
import { CreateActionContentStep } from './steps/CreateActionContentStep';

export const HandOffToAdminWizard = () => {
  return (
    <Wizard>
      <Wizard.Steps>
        <Wizard.Step key="Create new resources" showUserInfo title="Create new resources">
          <GenerateActionContentStep />
        </Wizard.Step>
        <Wizard.Step key="Configure resources" showUserInfo title="Configure resources">
          <CreateActionContentStep />
        </Wizard.Step>
      </Wizard.Steps>
    </Wizard>
  );
};
