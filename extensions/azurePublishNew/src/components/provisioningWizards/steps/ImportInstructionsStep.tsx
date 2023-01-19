// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import formatMessage from 'format-message';
import { Text } from '@fluentui/react/lib/Text';
import styled from '@emotion/styled';
import { Link, Stack } from '@fluentui/react';
import { SectionTitle } from '@bfc/ui-shared';

const Content = styled(Stack)`
  padding: 0px 20px;
`;

const Summary = styled.div`
  margin: 8px 0;
`;

const ResourceTitle = styled(Stack)`
  margin: 4px 0;
`;

const Details = styled(Stack)`
  margin: 10px 0;
`;

const LearnMoreLink = styled(Link)`
  user-select: none;
  font-size: 14px;
`;

export const ImportInstructionsStep = () => {
  return (
    <Content>
      <SectionTitle level={2}>{formatMessage('Use existing resources')}</SectionTitle>
      <Summary>
        <Text>
          {formatMessage(
            'Select this option if you have access to existing Azure resources and their associated values.'
          )}
        </Text>
      </Summary>
      <Summary>
        <Text>
          {formatMessage(
            'Copy and paste the JSON file containing the values of your existing Azure resources, from the Azure portal. This file includes values for some or all of the following:'
          )}
        </Text>
      </Summary>

      <Details>
        <ResourceTitle>
          <Text>- {formatMessage('Microsoft Application Registration')}</Text>
        </ResourceTitle>
        <ResourceTitle>
          <Text>- {formatMessage('App Services')}</Text>
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
