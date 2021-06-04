// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import formatMessage from 'format-message';
import { Text } from 'office-ui-fabric-react/lib/Text';

import {
  Content,
  Details,
  Instruction,
  InstructionDetails,
  InstructionTitle,
  LearnMoreLink,
  Summary,
  Title,
} from '../../ChooseProvisionActionStep';

export const GenerateActionContentStep = () => {
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
      <LearnMoreLink href="https://aka.ms/composer-publishingprofile-handoffadmin" target="_blank">
        {formatMessage('Learn More')}
      </LearnMoreLink>
    </Content>
  );
};
