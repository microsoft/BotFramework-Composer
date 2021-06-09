// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { usePublishApi } from '@bfc/extension-client';

import { userInfoState } from '../../recoilModel/atoms/resourceConfigurationState';
import { Wizard, WizardStep } from '../shared/wizard/Wizard';

import { WizardFooterWithUserPersona } from './footers/WizardFooterWithUserPersona';
import {
  CreateResourceInstructionsStep,
  ChooseResourcesStep,
  ResourceConfigurationStep,
  ReviewResourcesStep,
} from './steps';

type Props = {
  onStepChange?: (stepIndex: number, step: WizardStep) => void;
  stepIndex?: number;
};

export const CreateResourcesWizard = React.memo((props: Props) => {
  const { stepIndex, onStepChange } = props;
  const userInfo = useRecoilValue(userInfoState);
  const [steps, setSteps] = React.useState<WizardStep[]>([]);
  const [isValidResourceConfiguration, setIsValidResourceConfiguration] = useState<boolean>(false);
  const { onBack } = usePublishApi();

  React.useEffect(() => {
    setSteps([
      {
        id: 'create-resource-instructions',
        title: formatMessage('Configure resources to your publishing profile'),
        subTitle: formatMessage('How would you like to provision Azure resources to your publishing profile?'),
        onRenderContent: () => <CreateResourceInstructionsStep />,
        onBack,
      },
      {
        id: 'configure-resources',
        title: formatMessage('Configure resources'),
        onRenderContent: () => (
          <ResourceConfigurationStep onResourceConfigurationChange={setIsValidResourceConfiguration} />
        ),
        navigationState: { canGoNext: isValidResourceConfiguration },
      },
      {
        id: 'add-resources',
        title: formatMessage('Add resources'),
        subTitle: formatMessage.rich(
          'Your bot needs the following resources based on its capabilities. Select resources that you want to provision in your publishing profile. <a>Learn more</a>',
          {
            a: ({ children }) => (
              <a
                key="add-resource-learn-more"
                href={'https://aka.ms/composer-publish-bot#create-new-azure-resources'}
                rel="noopener noreferrer"
                target="_blank"
              >
                {children}
              </a>
            ),
          }
        ),
        onRenderContent: () => <ChooseResourcesStep />,
      },
      {
        id: 'review-resources',
        title: formatMessage('Review resources to be created'),
        subTitle: formatMessage(
          'The following resources will be created and provisioned for your bot. Once provisioned, they will be available in the Azure portal.'
        ),
        onRenderContent: () => <ReviewResourcesStep />,
        navigationState: { nextText: formatMessage('Done') },
      },
    ]);
  }, [isValidResourceConfiguration, userInfo]);

  return (
    <Wizard
      firstStepId={steps[stepIndex]?.id ?? 'create-resource-instructions'}
      steps={steps}
      onRenderFooter={(navState) => <WizardFooterWithUserPersona userInfo={userInfo} {...navState} />}
      onRenderHeader={() => <></>}
      onStepChange={(index, step) => onStepChange(index, step)}
    />
  );
});
