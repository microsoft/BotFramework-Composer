// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import formatMessage from 'format-message';
import { Text } from 'office-ui-fabric-react/lib/Text';

import { Content, Details, LearnMoreLink, ResourceTitle, Summary, Title } from '../../ChooseProvisionActionStep';

export const ImportActionContentStep = () => {
  return (
    <Content>
      <Title>{formatMessage('Use existing resources')}</Title>
      <Summary>
        <p>
          <Text>
            {formatMessage(
              'Select this option if you have access to existing Azure resources and their associated values.'
            )}
          </Text>
        </p>
        <p>
          <Text>
            {formatMessage(
              'Copy and paste the JSON file containing the values of your existing Azure resources, from the Azure portal. This file includes values for some or all of the following:'
            )}
          </Text>
        </p>
      </Summary>
      <Details>
        <ResourceTitle>
          <Text>- {formatMessage('Microsoft Application Registration')}</Text>
        </ResourceTitle>
        <ResourceTitle>
          <Text>- {formatMessage('Azure Hosting')}</Text>
        </ResourceTitle>
        <ResourceTitle>
          <Text>- {formatMessage('Microsoft Bot Channels Registration')}</Text>
        </ResourceTitle>
        <ResourceTitle>
          <Text>- {formatMessage('Azure Cosmos DB')}</Text>
        </ResourceTitle>
        <ResourceTitle>
          <Text>- {formatMessage('Application Insights')}</Text>
        </ResourceTitle>
        <ResourceTitle>
          <Text>- {formatMessage('Azure Blob Storage')}</Text>
        </ResourceTitle>
        <ResourceTitle>
          <Text>- {formatMessage('Microsoft Language Understanding (LUIS)')}</Text>
        </ResourceTitle>
        <ResourceTitle>
          <Text>- {formatMessage('Microsoft QnA Maker')}</Text>
        </ResourceTitle>
      </Details>
      <LearnMoreLink href="https://aka.ms/composer-getstarted-importpublishing" target="_blank">
        {formatMessage('Learn More')}
      </LearnMoreLink>
    </Content>
  );
};
