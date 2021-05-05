// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as React from 'react';
import formatMessage from 'format-message';
import styled from '@emotion/styled';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import { Link } from 'office-ui-fabric-react/lib/Link';

// ---------- Styles ---------- //

const Root = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 30% 1fr;
  grid-template-rows: 1fr;
`;

const ChoicesPane = styled.div`
  height: 100%;
  width: 100%;
`;

const ContentPane = styled(Stack)`
  border-left: 1px solid ${NeutralColors.gray30};
  height: 100%;
  overflow-y: auto;
`;

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

const ResourceTitle = styled(Stack)`
  margin: 4px 0;
`;

const LearnMoreLink = styled(Link)`
  user-select: none;
  font-size: 14px;
`;

// ---------- CreateActionContent ---------- //

const CreateActionContent = () => {
  return (
    <Content>
      <Title>{formatMessage('Create new resources')}</Title>
      <Summary>
        <Text>
          {formatMessage(
            'Select this option when you want to provision new Azure resources and publish a bot. A subscription to '
          )}
        </Text>
        <LearnMoreLink href="https://aka.ms/azureSignUpPage" target="_blank">
          {formatMessage('Microsoft Azure')}
        </LearnMoreLink>
        <Text>{formatMessage(' is required. ')}</Text>
        <LearnMoreLink href="https://aka.ms/composer-publish-bot#create-new-azure-resources" target="_blank">
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
        <Text>{formatMessage('Once provisioned, your new resources will be available in the Azure portal. ')}</Text>
        <LearnMoreLink href="https://aka.ms/composer-publish-bot#create-new-azure-resources" target="_blank">
          {formatMessage('Learn More')}
        </LearnMoreLink>
      </Summary>
    </Content>
  );
};

const ImportActionContent = () => {
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

const GenerateActionContent = () => {
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

// ---------- Helpers ---------- //

const choiceOptions: IChoiceGroupOption[] = [
  { key: 'create', text: 'Create new resources' },
  { key: 'import', text: 'Import existing resources' },
  { key: 'generate', text: 'Hand off to admin' },
];

// ---------- ChooseProvisionActionStep ---------- //

type ProvisionAction = 'create' | 'import' | 'generate';

type Props = {
  /**
   * The optional choice of provisioning action.
   * Defaults to 'create'.
   */
  choice?: ProvisionAction;

  onChoiceChanged: (choice: ProvisionAction) => void;
};

/**
 * Provides the step where the user can choose a provisioning action.
 */
export const ChooseProvisionAction = ({ choice: controlledChoice, onChoiceChanged }) => {
  const [choice, setChoice] = React.useState(controlledChoice || 'create');

  React.useEffect(() => {
    setChoice(controlledChoice || 'create');
  }, [controlledChoice]);

  React.useEffect(() => {
    onChoiceChanged(choice);
  }, [choice]);

  const renderContent = React.useMemo(() => {
    switch (choice) {
      case 'create':
        return <CreateActionContent />;
      case 'import':
        return <ImportActionContent />;
      case 'generate':
        return <GenerateActionContent />;
    }
  }, [choice]);

  return (
    <Root>
      <ChoicesPane>
        <ChoiceGroup
          options={choiceOptions}
          selectedKey={choice}
          onChange={(_e, option) => {
            setChoice(option.key);
          }}
        />
      </ChoicesPane>
      <ContentPane>{renderContent}</ContentPane>
    </Root>
  );
};
