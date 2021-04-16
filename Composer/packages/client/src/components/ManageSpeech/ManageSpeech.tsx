// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { CognitiveServicesManagementClient } from '@azure/arm-cognitiveservices';
import { TokenCredentials } from '@azure/ms-rest-js';
import formatMessage from 'format-message';

import { ManageService } from '../ManageService/ManageService';

type ManageSpeechProps = {
  hidden: boolean;
  onDismiss: () => void;
  onGetKey: (settings: { key: string; region: string }) => void;
  onNext?: () => void;
  onToggleVisibility: (visible: boolean) => void;
};

export const ManageSpeech = (props: ManageSpeechProps) => {
  const createService = async (
    tokenCredentials: TokenCredentials,
    subscriptionId: string,
    resourceGroupName: string,
    resourceName: string,
    region: string
  ): Promise<string> => {
    const cognitiveServicesManagementClient = new CognitiveServicesManagementClient(tokenCredentials, subscriptionId);
    await cognitiveServicesManagementClient.accounts.create(resourceGroupName, resourceName, {
      kind: 'SpeechServices',
      sku: {
        name: 'S0',
      },
      location: region,
    });

    const keys = await cognitiveServicesManagementClient.accounts.listKeys(resourceGroupName, resourceName);
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
        '1. Using the Azure portal, please create a Speech resource on my behalf.\n2. Once provisioned, securely share the resulting credentials with me as described in the link below.\n\nDetailed instructions:\nhttps://aka.ms/bfcomposerhandoffdls'
      )}
      hidden={props.hidden}
      serviceKeyType={'SpeechServices'}
      serviceName={'Speech'}
      onDismiss={props.onDismiss}
      onGetKey={props.onGetKey}
      onNext={props.onNext}
      onToggleVisibility={props.onToggleVisibility}
    />
  );
};
