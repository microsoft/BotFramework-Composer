// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { TokenCredentials } from '@azure/ms-rest-js';
import formatMessage from 'format-message';
import { useRecoilValue } from 'recoil';

import { dispatcherState } from '../../recoilModel';
import { ManageService } from '../ManageService/ManageService';
import { currentProjectIdState } from '../../recoilModel';
import { rootBotProjectIdSelector } from '../../recoilModel/selectors/project';

const QNA_REGIONS = [{ key: 'westus', text: 'West US' }];
const QNA_TIERS = [
  { key: 'free', text: 'Free' },
  { key: 'paid', text: 'Paid' },
];

type ManageQNAProps = {
  hidden: boolean;
  onDismiss: () => void;
  onGetKey: (settings: { key: string; region: string }) => void;
  onNext?: () => void;
  onToggleVisibility: (visible: boolean) => void;
};

export const ManageQNA = (props: ManageQNAProps) => {
  const { createQNA } = useRecoilValue(dispatcherState);
  const projectId = useRecoilValue(currentProjectIdState);
  const rootBotProjectId = useRecoilValue(rootBotProjectIdSelector) || projectId;

  const createService = async (
    tokenCredentials: TokenCredentials,
    subscriptionId: string,
    resourceGroupName: string,
    resourceName: string,
    region: string,
    tier?: string
  ): Promise<string> => {
    // hide modal
    props.onToggleVisibility(false);

    // start background QNA
    createQNA(
      rootBotProjectId,
      tokenCredentials,
      subscriptionId,
      resourceGroupName,
      resourceName,
      region,
      tier || 'free'
    );
    return '';
  };

  return (
    <ManageService
      createServiceInBackground
      createService={createService}
      handoffInstructions={formatMessage(
        '1. Using the Azure portal, please create a QnAMaker resource on my behalf.\n2. Once provisioned, securely share the resulting credentials with me as described in the link below.\n\nDetailed instructions:\nhttps://aka.ms/bfcomposerhandoffqnamaker'
      )}
      hidden={props.hidden}
      learnMore={'https://aka.ms/composer-addqnamaker-learnmore'}
      regions={QNA_REGIONS}
      serviceKeyType={'QnAMaker'}
      serviceName={'QnA Maker'}
      tiers={QNA_TIERS}
      onDismiss={props.onDismiss}
      onGetKey={props.onGetKey}
      onNext={props.onNext}
      onToggleVisibility={props.onToggleVisibility}
    />
  );
};
