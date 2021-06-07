// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import { usePublishApi } from '@bfc/extension-client';

import { userInfoState } from '../../recoilModel/atoms/resourceConfigurationState';
import { Wizard, WizardStep } from '../shared/wizard/Wizard';

import { WizardFooterWithUserPersona } from './footers/WizardFooterWithUserPersona';
import { CreateActionContentStep, ChooseResourcesStep, ResourceConfigurationStep, ReviewResourcesStep } from './steps';
type Props = {
  onStepChange: (stepId: string) => void;
  stepIndex?: number;
};
export const CreateResourcesWizard = React.memo((props: Props) => {
  const { stepIndex, onStepChange } = props;
  const userInfo = useRecoilValue(userInfoState);
  const [steps, setSteps] = React.useState<WizardStep[]>([]);
  const [isValidResourceConfiguration, setIsValidResourceConfiguration] = useState<boolean>(false);
  const { setTitle, onBack } = usePublishApi();

  const setDialogTitle = (step: WizardStep) => {
    step && setTitle({ title: step.title, subText: step.subTitle });
    return <></>;
  };
  React.useEffect(() => {
    setSteps([
      {
        id: '1',
        title: formatMessage('Configure resources to your publishing profile'),
        subTitle: formatMessage('How would you like to provision Azure resources to your publishing profile?'),
        onRenderContent: () => <CreateActionContentStep />,
        onBack,
      },
      {
        id: '2',
        title: formatMessage('Configure resources'),
        onRenderContent: () => (
          <ResourceConfigurationStep onResourceConfigurationChange={setIsValidResourceConfiguration} />
        ),
        navigationState: { canGoNext: isValidResourceConfiguration },
      },
      {
        id: '3',
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
        id: '4',
        title: formatMessage('Review resources to be created'),
        subTitle: formatMessage(
          'The following resources will be created and provisioned for your bot. Once provisioned, they will be available in the Azure portal.'
        ),
        onRenderContent: () => <ReviewResourcesStep />,
        navigationState: { nextText: 'Done' },
      },
    ]);
  }, [isValidResourceConfiguration, userInfo]);
  return (
    <Wizard
      firstStepId={stepIndex?.toString() ?? '1'}
      steps={steps}
      onRenderFooter={(navState) => <WizardFooterWithUserPersona userInfo={userInfo} {...navState} />}
      onRenderHeader={(step) => setDialogTitle(step)}
      onStepChange={(step) => onStepChange(step.id)}
    />
  );
});
