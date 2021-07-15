// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { usePublishApi } from '@bfc/extension-client';
import formatMessage from 'format-message';
import { ProvisionHandoff } from '@bfc/ui-shared';
import { useRecoilValue } from 'recoil';

import { WizardStep, Wizard } from '../shared/wizard';
import { useDispatcher } from '../../hooks/useDispatcher';
import { enabledHandOffResourcesState } from '../../recoilModel/atoms/handOffToAdminState';
import { useHandOffInstructions } from '../../hooks/useHandOffInstructions';

import { HandOffInstructionsStep } from './steps/HandOffInstructionsStep';
import { WizardFooter } from './footers/WizardFooter';
import { ChooseResourcesStep } from './steps/ChooseResourcesStep';

type Props = {
  onStepChange?: (stepIndex: number, step: WizardStep) => void;
  stepIndex?: number;
};

const urls = {
  createNewResources: 'https://aka.ms/composer-publish-bot#create-new-azure-resources',
  provisionHandOff: 'https://aka.ms/how-to-complete-provision-handoff',
};

export const HandOffToAdminWizard = React.memo((props: Props) => {
  const { onStepChange } = props;
  const [steps, setSteps] = React.useState<WizardStep[]>([]);
  const { onBack, closeDialog: onCancel } = usePublishApi();
  const resources = useRecoilValue(enabledHandOffResourcesState);
  const { setEnabledHandOffResources } = useDispatcher();
  const [showHandOff, setShowHandOff] = React.useState<boolean>(false);
  const handOffInstructions = useHandOffInstructions();

  React.useEffect(() => {
    setSteps([
      {
        id: 'handoff-instructions',
        title: formatMessage('Configure resources to your publishing profile'),
        subTitle: formatMessage('How would you like to provision Azure resources to your publishing profile?'),
        onRenderContent: () => <HandOffInstructionsStep />,
        onBack,
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
          <ChooseResourcesStep enabledResources={resources} onChangeSelection={setEnabledHandOffResources} />
        ),
        onCancel,
        onNext: () => setShowHandOff(true),
      },
    ]);
  }, [resources]);

  return (
    <>
      <Wizard
        firstStepId="handoff-instructions"
        steps={steps}
        onRenderFooter={(navState) => <WizardFooter {...navState} />}
        onRenderHeader={() => <></>}
        onStepChange={(index, step) => onStepChange(index, step)}
      />
      {showHandOff && (
        <ProvisionHandoff
          developerInstructions={formatMessage(
            'If Azure resources and subscription are managed by others, use the following information to request creation of the resources that you need to build and run your bot.'
          )}
          handoffInstructions={handOffInstructions}
          hidden={!showHandOff}
          learnMoreLink={urls.provisionHandOff}
          title={formatMessage('Generate instructions for Azure administrator')}
          onBack={() => {
            setShowHandOff(false);
          }}
          onDismiss={() => {
            onCancel();
          }}
        />
      )}
    </>
  );
});
