// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import formatMessage from 'format-message';
import { Text } from 'office-ui-fabric-react/lib/Text';
import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import { Link, Stack } from 'office-ui-fabric-react';

const Content = styled(Stack)`
  padding: 0px 20px;
`;

const Title = styled(Text)`
  font-size: ${FluentTheme.fonts.xLarge.fontSize};
  margin: 8px 0;
`;

const Summary = styled.div`
  margin: 8px 0;
`;

const Details = styled(Stack)`
  margin: 10px 0;
`;

const Instruction = styled(Stack)`
  margin: 10px 0;
`;

const InstructionTitle = styled(Text)`
  font-size: ${FluentTheme.fonts.smallPlus.fontSize};
  text-transform: uppercase;
`;

const InstructionDetails = styled.div`
  margin: 10px 0;
`;

const LearnMoreLink = styled(Link)`
  user-select: none;
  font-size: 14px;
`;

const urls = {
  createNewResources: 'https://aka.ms/composer-publish-bot#create-new-azure-resources',
  microsoftAzure: 'https://aka.ms/azureSignUpPage',
};

export const CreateResourceInstructionsStep = () => {
  return (
    <Content>
      <Title>{formatMessage('Create new resources')}</Title>
      <Summary>
        <Text>
          {formatMessage(
            'Select this option when you want to provision new Azure resources and publish a bot. A subscription to'
          )}
        </Text>
        &nbsp;
        <LearnMoreLink href={urls.microsoftAzure} target="_blank">
          {formatMessage('Microsoft Azure')}
        </LearnMoreLink>
        &nbsp;
        <Text>{formatMessage('is required.')}</Text>
        &nbsp;
        <LearnMoreLink href={urls.createNewResources} target="_blank">
          {formatMessage('Learn more')}
        </LearnMoreLink>
      </Summary>
      <Details>
        <Instruction>
          <InstructionTitle>{formatMessage('Step 1')}</InstructionTitle>
          <InstructionDetails>
            <Text>{formatMessage('Sign in to Azure.')}</Text>
          </InstructionDetails>
        </Instruction>
        <Instruction>
          <InstructionTitle>{formatMessage('Step 2')}</InstructionTitle>
          <InstructionDetails>
            <Text>{formatMessage('Select Azure subscription and resource group name')}</Text>
          </InstructionDetails>
        </Instruction>
        <Instruction>
          <InstructionTitle>{formatMessage('Step 3')}</InstructionTitle>
          <InstructionDetails>
            <Text>{formatMessage('Select and name your new resources')}</Text>
          </InstructionDetails>
        </Instruction>
        <Instruction>
          <InstructionTitle>{formatMessage('Step 4')}</InstructionTitle>
          <InstructionDetails>
            <Text>{formatMessage('Review and confirm resources to be created')}</Text>
          </InstructionDetails>
        </Instruction>
      </Details>
      <Summary>
        <Text>{formatMessage('Once provisioned, your new resources will be available in the Azure portal.')}</Text>
        &nbsp;
        <LearnMoreLink href={urls.createNewResources} target="_blank">
          {formatMessage('Learn More')}
        </LearnMoreLink>
      </Summary>
    </Content>
  );
};
