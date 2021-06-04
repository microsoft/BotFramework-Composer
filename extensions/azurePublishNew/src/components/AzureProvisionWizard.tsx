// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { RecoilRoot } from 'recoil';

import { ProvisionAction } from '../types';

import { ChooseProvisionAction } from './ChooseProvisionActionStep';
import { CreateResourcesWizard, HandOffToAdminWizard, ImportResourcesWizard } from './provisioningWizards';

const Root = styled.div`
  height: calc(100vh - 65px);
`;

export const AzureProvisionWizard = () => {
  const [provisionAction, setProvisionAction] = useState<ProvisionAction>('create');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const handleStepChange = (index: number) => {
    console.log(index);
    setActiveStepIndex(index);
  };

  const renderContent = React.useCallback(() => {
    switch (provisionAction) {
      case 'create':
        return <CreateResourcesWizard stepId={activeStepIndex} onStepChange={handleStepChange} />;
      case 'import':
        return <ImportResourcesWizard />;
      case 'generate':
        return <HandOffToAdminWizard />;
    }
  }, [provisionAction, activeStepIndex]);

  return (
    <RecoilRoot>
      <Root>
        {activeStepIndex === 0 && (
          <ChooseProvisionAction
            selectedProvisionAction={provisionAction}
            showChoices={activeStepIndex === 0}
            onChangeSelectedProvisionAction={setProvisionAction}
          >
            {renderContent()}
          </ChooseProvisionAction>
        )}
        {activeStepIndex > 0 && renderContent()}
      </Root>
    </RecoilRoot>
  );
};
