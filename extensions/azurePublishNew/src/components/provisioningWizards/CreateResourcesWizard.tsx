// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { usePublishApi, useAuthApi } from '@bfc/extension-client';

import { Wizard, WizardStep } from '../shared/wizard/Wizard';
import { useResourceConfiguration } from '../../hooks/useResourceConfiguration';
import { enabledResourcesState } from '../../recoilModel/atoms/resourceConfigurationState';
import { useDispatcher } from '../../hooks/useDispatcher';

import { WizardFooter } from './footers/WizardFooter';
import { CreateResourceInstructionsStep } from './steps/CreateResourceInstructionsStep';
import { ResourceConfigurationStep } from './steps/ResourceConfigurationStep';
import { ChooseResourcesStep } from './steps/ChooseResourcesStep';
import { ReviewResourcesStep } from './steps/ReviewResourcesStep';

type Props = {
  onStepChange?: (stepIndex: number, step: WizardStep) => void;
  stepIndex?: number;
};

const urls = {
  createNewResources: 'https://aka.ms/composer-publish-bot#create-new-azure-resources',
};

export const CreateResourcesWizard = React.memo((props: Props) => {
  const { onStepChange } = props;
  const [steps, setSteps] = React.useState<WizardStep[]>([]);
  const [isValidResourceConfiguration, setIsValidResourceConfiguration] = useState<boolean>(false);
  const { onBack, closeDialog: onCancel } = usePublishApi();
  const { stashWizardState } = useResourceConfiguration();
  const enabledResources = useRecoilValue(enabledResourcesState);
  const { setEnabledResources } = useDispatcher();
  const { currentUser } = useAuthApi();

  React.useEffect(() => {
    setSteps([
      {
        id: 'create-resource-instructions',
        title: formatMessage('Configure resources to your publishing profile'),
        subTitle: formatMessage('How would you like to provision Azure resources to your publishing profile?'),
        onRenderContent: () => <CreateResourceInstructionsStep />,
        onBack,
        onCancel,
      },
      {
        id: 'configure-resources',
        title: formatMessage('Configure resources'),
        onRenderContent: () => (
          <ResourceConfigurationStep onResourceConfigurationChange={setIsValidResourceConfiguration} />
        ),
        navigationState: { canGoNext: isValidResourceConfiguration },
        onBack: () => stashWizardState(),
        onCancel,
      },
      {
        id: 'add-resources',
        title: formatMessage('Add resources'),
        subTitle: formatMessage.rich(
          'Your bot needs the following resources based on its capabilities. Select resources that you want to provision in your publishing profile. <a>Learn more</a>',
          {
            a: ({ children }) => (
              <a key="add-resource-learn-more" href={urls.createNewResources} rel="noopener noreferrer" target="_blank">
                {children}
              </a>
            ),
          }
        ),
        onRenderContent: () => (
          <ChooseResourcesStep enabledResources={enabledResources} onChangeSelection={setEnabledResources} />
        ),
        onCancel,
      },
      {
        id: 'review-resources',
        title: formatMessage('Review resources to be created'),
        subTitle: formatMessage(
          'The following resources will be created and provisioned for your bot. Once provisioned, they will be available in the Azure portal.'
        ),
        onRenderContent: () => <ReviewResourcesStep />,
        navigationState: { nextText: formatMessage('Done') },
        onCancel,
      },
    ]);
  }, [isValidResourceConfiguration, enabledResources]);

  return (
    <Wizard
      firstStepId="create-resource-instructions"
      steps={steps}
      onRenderFooter={(navState) => <WizardFooter currentUser={currentUser} {...navState} />}
      onRenderHeader={() => <></>}
      onStepChange={(index, step) => onStepChange(index, step)}
    />
  );
});
