// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import formatMessage from 'format-message';
import styled from '@emotion/styled';
import { FluentTheme } from '@uifabric/fluent-theme';
import { Link, Stack, Text } from 'office-ui-fabric-react';

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
  handOffAdmin: 'https://aka.ms/composer-publishingprofile-handoffadmin',
};

export const HandOffInstructionsStep = () => {
  return (
    <Content>
      <Title>{formatMessage('Hand off to admin')}</Title>
      <Summary>
        <Text>
          {formatMessage(
            'Select this option to request your Azure admin to provision resources on your behalf, for example, when you don’t have proper permissions to use Azure or you want to generate resources from a sovereign cloud.'
          )}
        </Text>
      </Summary>
      <Details>
        <Instruction>
          <InstructionTitle>{formatMessage('Step 1')}</InstructionTitle>
          <InstructionDetails>
            <Text>
              {formatMessage(
                'Add resources you need for the bot and generate a resource request to share with your Azure admin.'
              )}
            </Text>
          </InstructionDetails>
        </Instruction>
        <Instruction>
          <InstructionTitle>{formatMessage('Step 2')}</InstructionTitle>
          <InstructionDetails>
            <Text>
              {formatMessage(
                'Once you get the resource details from your Azure admin, use them to import existing resources.'
              )}
            </Text>
          </InstructionDetails>
        </Instruction>
      </Details>
      <LearnMoreLink href={urls.handOffAdmin} target="_blank">
        {formatMessage('Learn More')}
      </LearnMoreLink>
    </Content>
  );
};
