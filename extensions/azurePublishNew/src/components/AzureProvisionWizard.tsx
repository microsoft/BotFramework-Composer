// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import styled from '@emotion/styled';
import { RecoilRoot } from 'recoil';
import { usePublishApi, useLocalStorage } from '@bfc/extension-client';

import { ProvisionAction } from '../types';
import { resourceConfigurationState } from '../recoilModel/atoms/resourceConfigurationState';

import { ChooseProvisionAction } from './ChooseProvisionAction';
import { CreateResourcesWizard } from './provisioningWizards/CreateResourcesWizard';
import { ImportResourcesWizard } from './provisioningWizards/ImportResourcesWizard';
import { HandOffToAdminWizard } from './provisioningWizards/HandOffToAdminWizard';

const Root = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 30% 1fr;
  grid-template-rows: 1fr;
`;

export const AzureProvisionWizard = () => {
  const [provisionAction, setProvisionAction] = useState<ProvisionAction>('create');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const { setTitle, getName } = usePublishApi();
  const { getItem } = useLocalStorage();

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
    <RecoilRoot
      initializeState={({ set }) => {
        set(resourceConfigurationState, (currentState) => ({
          ...currentState,
          ...getItem(getName()),
        }));
      }}
    >
      <Root>
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
