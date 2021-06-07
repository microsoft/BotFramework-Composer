// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { RecoilRoot } from 'recoil';

import { ProvisionAction } from '../types';

import { ChooseProvisionAction } from './ChooseProvisionActionStep';
import { CreateResourcesWizard, HandOffToAdminWizard, ImportResourcesWizard } from './provisioningWizards';
type RootStyleProps = {
  stepIndex: number;
};
const Root = styled.div<RootStyleProps>(({ stepIndex }) => ({
  height: stepIndex === 1 ? 'unset' : 'calc(100vh - 65px)',
}));

export const AzureProvisionWizard = () => {
  const [provisionAction, setProvisionAction] = useState<ProvisionAction>('create');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(1);

  const renderContent = React.useCallback(() => {
    switch (provisionAction) {
      case 'create':
        return (
          <CreateResourcesWizard stepIndex={activeStepIndex} onStepChange={(s) => setActiveStepIndex(parseInt(s))} />
        );
      case 'import':
        return <ImportResourcesWizard />;
      case 'generate':
        return <HandOffToAdminWizard />;
    }
  }, [provisionAction, activeStepIndex]);

  // const content = React.useMemo(() => renderContent(), [renderContent]);

  return (
    <RecoilRoot>
      <Root stepIndex={activeStepIndex}>
        <ChooseProvisionAction
          selectedProvisionAction={provisionAction}
          showChoices={activeStepIndex === 1}
          onChangeSelectedProvisionAction={setProvisionAction}
        >
          {renderContent()}
        </ChooseProvisionAction>
      </Root>
    </RecoilRoot>
  );
};
