// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';

import { Wizard } from '../shared/wizard/Wizard';

import { ImportActionContentStep } from './steps/ImportActionContentStep';
import { CreateActionContentStep } from './steps/CreateActionContentStep';

export const ImportResourcesWizard = () => {
  return (
    <Wizard>
      <Wizard.Steps>
        <Wizard.Step key="Create new resources" title="Create new resources">
          <ImportActionContentStep />
        </Wizard.Step>

        <Wizard.Step key="Configure resources" title="Configure resources">
          <CreateActionContentStep />
        </Wizard.Step>
      </Wizard.Steps>
    </Wizard>
  );
};
