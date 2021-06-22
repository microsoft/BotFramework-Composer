// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import { usePublishApi } from '@bfc/extension-client';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';
import { ProvisionHandoff } from '@bfc/ui-shared';

import { WizardStep, Wizard } from '../shared/wizard';
import { useDispatcher } from '../../hooks/useDispatcher';
import { enabledHandOffResourcesState } from '../../recoilModel/atoms/handOffToAdminState';
import {
  subscriptionState,
  hostNameState,
  resourceGroupState,
  deployLocationState,
} from '../../recoilModel/atoms/resourceConfigurationState';

import { HandOffInstructionsStep } from './steps/HandOffInstructionsStep';
import { WizardFooter } from './footers/WizardFooter';
import { ChooseResourcesStep } from './steps/ChooseResourcesStep';

type Props = {
  onStepChange?: (stepIndex: number, step: WizardStep) => void;
  stepIndex?: number;
};

const urls = {
  createNewResources: 'https://aka.ms/composer-publish-bot#create-new-azure-resources',
};

export const HandOffToAdminWizard = React.memo((props: Props) => {
  const { onStepChange } = props;
  const [steps, setSteps] = React.useState<WizardStep[]>([]);
  const { onBack, closeDialog: onCancel } = usePublishApi();
  const resources = useRecoilValue(enabledHandOffResourcesState);
  const subscriptionId = useRecoilValue(subscriptionState);
  const hostName = useRecoilValue(hostNameState);
  const deployRegion = useRecoilValue(deployLocationState);
  const { name: resourceGroupName } = useRecoilValue(resourceGroupState);
  const { setEnabledHandOffResources } = useDispatcher();
  const [showHandOff, setShowHandOff] = React.useState<boolean>(false);

  const handOffInstructions = React.useMemo(() => {
    let instructions = '';
    if (showHandOff) {
      const createLuisResource = resources?.filter((r) => r.key === 'luisPrediction').length > 0;
      const createLuisAuthoringResource = resources?.filter((r) => r.key === 'luisAuthoring').length > 0;
      const createCosmosDb = resources?.filter((r) => r.key === 'cosmosDb').length > 0;
      const createStorage = resources?.filter((r) => r.key === 'blobStorage').length > 0;
      const createAppInsights = resources?.filter((r) => r.key === 'applicationInsights').length > 0;
      const createQnAResource = resources?.filter((r) => r.key === 'qna').length > 0;

      const provisionComposer = `node provisionComposer.js --subscriptionId ${
        subscriptionId || '<YOUR SUBSCRIPTION ID>'
      } --name ${hostName || '<RESOURCE NAME>'} --appPassword=<16 CHAR PASSWORD> --location=${
        deployRegion || 'westus'
      } --resourceGroup=${
        resourceGroupName || '<RESOURCE GROUP NAME>'
      } --createLuisResource=${createLuisResource} --createLuisAuthoringResource=${createLuisAuthoringResource} --createCosmosDb=${createCosmosDb} --createStorage=${createStorage} --createAppInsights=${createAppInsights} --createQnAResource=${createQnAResource}`;

      instructions = formatMessage(
        'I am creating a conversational experience using Microsoft Bot Framework project.' +
          ' For my project to work, Azure resources, including app registration, hosting, channels, Language Understanding, and QnA Maker, are required.' +
          ' Below are the steps to create these resources.\n\n' +
          '1. Follow the instructions at the link below to run the provisioning command (seen below)\n' +
          '2. Copy and paste the resulting JSON and securely share it with me.\n\n' +
          'Provisoning Command:\n' +
          '{command}\n\n' +
          'Detailed instructions:\nhttps://aka.ms/how-to-complete-provision-handoff',
        { command: provisionComposer }
      );
    }
    return instructions;
  }, [resources, subscriptionId, hostName, deployRegion, resourceGroupName, showHandOff]);

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
          learnMoreLink="https://aka.ms/how-to-complete-provision-handoff"
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
