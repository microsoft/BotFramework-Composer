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

export const HandOffInstructionsStep = () => {
  return (
    <Content>
      <Title>{formatMessage('Hand off to admin')}</Title>
      <Summary>
        {formatMessage.rich(
          '<text>Select this option to request your Azure admin to provision resources on your behalf, for example, when you don’t have proper permissions to use Azure or you want to generate resources from a sovereign cloud.</text>',
          {
            text: ({ children }) => <Text key="step_0">{children}</Text>,
          }
        )}
      </Summary>
      <Details>
        <Instruction>
          <InstructionTitle>{formatMessage('Step 1')}</InstructionTitle>
          <InstructionDetails>
            {formatMessage.rich(
              '<text>Add resources you need for the bot and generate a resource request to share with your Azure admin.</text>',
              {
                text: ({ children }) => <Text key="step_1">{children}</Text>,
              }
            )}
          </InstructionDetails>
        </Instruction>
        <Instruction>
          <InstructionTitle>{formatMessage('Step 2')}</InstructionTitle>
          <InstructionDetails>
            {formatMessage.rich(
              '<text>Once you get the resource details from your Azure admin, use them to import existing resources.</text>',
              {
                text: ({ children }) => <Text key="step_2">{children}</Text>,
              }
            )}
          </InstructionDetails>
        </Instruction>
      </Details>
      <LearnMoreLink href="https://aka.ms/composer-publishingprofile-handoffadmin" target="_blank">
        {formatMessage('Learn More')}
      </LearnMoreLink>
    </Content>
  );
};
