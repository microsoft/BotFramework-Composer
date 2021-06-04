// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { RecoilRoot } from 'recoil';

import { Wizard } from '../shared/wizard/Wizard';

import { GenerateActionContentStep, CreateActionContentStep } from './steps';

export const HandOffToAdminWizard = () => {
  return (
    <Wizard>
      <Wizard.Steps>
        <Wizard.Step key="Create new resources">
          <GenerateActionContentStep />
        </Wizard.Step>
        <Wizard.Step key="Configure resources">
          <CreateActionContentStep />
        </Wizard.Step>
      </Wizard.Steps>
    </Wizard>
  );
};
