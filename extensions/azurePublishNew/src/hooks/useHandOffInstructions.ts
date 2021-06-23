// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';

import {
  subscriptionState,
  hostNameState,
  deployLocationState,
  resourceGroupState,
} from '../recoilModel/atoms/resourceConfigurationState';
import { enabledHandOffResourcesState } from '../recoilModel/atoms/handOffToAdminState';

export const useHandOffInstructions = () => {
  const subscriptionId = useRecoilValue(subscriptionState);
  const hostName = useRecoilValue(hostNameState);
  const deployRegion = useRecoilValue(deployLocationState);
  const { name: resourceGroupName } = useRecoilValue(resourceGroupState);
  const resources = useRecoilValue(enabledHandOffResourcesState);

  return React.useMemo(() => {
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

    return formatMessage(
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
  }, [resources, subscriptionId, hostName, deployRegion, resourceGroupName]);
};
