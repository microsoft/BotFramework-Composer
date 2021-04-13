// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { CognitiveServicesManagementClient } from '@azure/arm-cognitiveservices';
import { TokenCredentials } from '@azure/ms-rest-js';
import formatMessage from 'format-message';

import { LUIS_REGIONS } from '../../constants';
import { ManageService } from '../ManageService/ManageService';

type ManageLuisProps = {
  hidden: boolean;
  onDismiss: () => void;
  onGetKey: (settings: { key: string; region: string }) => void;
  onNext?: () => void;
  setVisible: (value: any) => void;
};

export const ManageLuis = (props: ManageLuisProps) => {
  const createService = async (
    tokenCredentials: TokenCredentials,
    subscriptionId: string,
    resourceGroupName: string,
    resourceName: string,
    region: string
  ): Promise<string> => {
    const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(tokenCredentials, subscriptionId);
    await cognitiveServicesManagementClient.accounts.create(resourceGroupName, `${resourceName}-authoring`, {
      kind: 'LUIS.Authoring',
      sku: {
        name: 'F0',
      },
      location: region,
    });

    const keys = await cognitiveServicesManagementClient.accounts.listKeys(
      resourceGroupName,
      `${resourceName}-authoring`
    );
    if (!keys?.key1) {
      throw new Error('No key found for newly created authoring resource');
    } else {
      return keys.key1;
    }
  };

  return (
    <ManageService
      createService={createService}
      handoffInstructions={formatMessage(
        'I am working on a Microsoft Bot Framework project, and I now require some Azure resources to be created. Please follow the instructions below to create these resources and provide them to me.\n\n1. Using the Azure portal, please create a Language Understanding resource on my behalf.\n2. Once provisioned, securely share the resulting credentials with me as described in the link below.\n\nDetailed instructions:\nhttps://aka.ms/bfcomposerhandoffluis'
      )}
      hidden={props.hidden}
      regions={LUIS_REGIONS}
      serviceKeyType={'LUIS.Authoring'}
      serviceName={'LUIS'}
      setVisible={props.setVisible}
      onDismiss={props.onDismiss}
      onGetKey={props.onGetKey}
      onNext={props.onNext}
    />
  );
};
