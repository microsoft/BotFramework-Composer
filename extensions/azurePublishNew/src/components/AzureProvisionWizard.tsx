// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { RecoilRoot } from 'recoil';
import { usePublishApi } from '@bfc/extension-client';

import { ProvisionAction } from '../types';
import { usePublishProfileInitializer } from '../hooks/usePublishProfileInitializer';

import { ChooseProvisionAction } from './ChooseProvisionAction';
import { CreateResourcesWizard } from './provisioningWizards/CreateResourcesWizard';
import { ImportResourcesWizard } from './provisioningWizards/ImportResourcesWizard';
import { HandOffToAdminWizard } from './provisioningWizards/HandOffToAdminWizard';

type RootStyleProps = {
  activeStepIndex: number;
};

const Root = styled.div<RootStyleProps>(({ activeStepIndex }) => ({
  height: '100%',
  width: '100%',
  display: 'grid',
  gridTemplateColumns: activeStepIndex === 0 ? '30% 1fr' : '1fr',
  gridTemplateRows: '1fr',
}));

export const AzureProvisionWizard = () => {
  const [provisionAction, setProvisionAction] = useState<ProvisionAction>('create');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const { setTitle } = usePublishApi();
  const initialize = usePublishProfileInitializer();

  const handleStepChange = (index, step) => {
    setActiveStepIndex(index);
    step && setTitle({ title: step.title, subText: step.subTitle });
  };

  const renderContent = React.useCallback(() => {
    switch (provisionAction) {
      case 'create':
        return <CreateResourcesWizard onStepChange={handleStepChange} />;
      case 'import':
        return <ImportResourcesWizard onStepChange={handleStepChange} />;
      case 'generate':
        return <HandOffToAdminWizard onStepChange={handleStepChange} />;
    }
  }, [provisionAction]);

  return (
    <RecoilRoot initializeState={initialize}>
      <Root activeStepIndex={activeStepIndex}>
        {!activeStepIndex && (
          <ChooseProvisionAction
            selectedProvisionAction={provisionAction}
            onChangeSelectedProvisionAction={setProvisionAction}
          ></ChooseProvisionAction>
        )}
        {renderContent()}
      </Root>
    </RecoilRoot>
  );
};
