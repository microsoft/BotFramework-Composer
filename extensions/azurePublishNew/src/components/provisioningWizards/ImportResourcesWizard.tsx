// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { RecoilRoot } from 'recoil';

import { Wizard } from '../shared/wizard/Wizard';

import { ImportActionContentStep, CreateActionContentStep } from './steps';

export const ImportResourcesWizard = () => {
  return (
    <Wizard>
      <Wizard.Steps>
        <Wizard.Step key="Create new resources">
          <ImportActionContentStep />
        </Wizard.Step>

        <Wizard.Step key="Configure resources">
          <CreateActionContentStep />
        </Wizard.Step>
      </Wizard.Steps>
    </Wizard>
  );
};
