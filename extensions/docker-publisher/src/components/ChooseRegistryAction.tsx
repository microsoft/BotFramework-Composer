import * as React from 'react';
import formatMessage from 'format-message';
import styled from '@emotion/styled';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Stack, Text, Link } from 'office-ui-fabric-react';
import { RegistryTypeOptions } from '../types';

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

const LearnMoreLink = styled(Link)`
  user-select: none;
  font-size: 14px;
`;

const LocalDockerActionContent = () => {
  return (
    <Content>
      <Title>{formatMessage('Local Registry')}</Title>
      <Summary>
        <Text>{formatMessage('Select this option to publish into local Docker Registry.')}</Text>
      </Summary>
      <Details></Details>
      <Summary>
        <Text>{formatMessage('Once published, your image will be available locally only.')}</Text>
      </Summary>
    </Content>
  );
};

const ACRActionContent = () => {
  return (
    <Content>
      <Title>{formatMessage('Azure Container Registry')}</Title>
      <Summary>
        <Text>{formatMessage('Select this option publish directly into')}</Text>
        &nbsp;
        <LearnMoreLink href="https://azure.microsoft.com/pt-br/services/container-registry/" target="_blank">
          {formatMessage('Microsoft Azure Container Registry')}
        </LearnMoreLink>
        <Text>{formatMessage('. A subscription to ')}</Text>
        &nbsp;
        <LearnMoreLink href="https://aka.ms/azureSignUpPage" target="_blank">
          {formatMessage('Microsoft Azure')}
        </LearnMoreLink>
        &nbsp;
        <Text>{formatMessage('is required.')}</Text>
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
        {/*<Instruction>
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
        </Instruction>*/}
      </Details>
      <Summary>
        <Text>
          {formatMessage('Once published, your image will be available privatly on Azure Container Registry Search.')}
        </Text>
      </Summary>
    </Content>
  );
};

const DockerHubActionContent = () => {
  return (
    <Content>
      <Title>{formatMessage('Docker Hub')}</Title>
      <Summary>
        <Text>{formatMessage('Select this option when you want to publish your bot to')}</Text>
        &nbsp;
        <LearnMoreLink href="https://hub.docker.com" target="_blank">
          {formatMessage('Docker Hub')}
        </LearnMoreLink>
        <Text>{formatMessage('. A subscription to ')}</Text>
        <LearnMoreLink href="https://hub.docker.com/signup" target="_blank">
          {formatMessage('Docker Hub')}
        </LearnMoreLink>
        &nbsp;
        <Text>{formatMessage('is required.')}</Text>
      </Summary>
      <Details>
        {/*<Instruction>
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
        </Instruction>*/}
      </Details>
      <Summary>
        <Text>{formatMessage('Once published, your image will be available on Docker Hub search.')}</Text>
      </Summary>
    </Content>
  );
};

const CustomActionContent = () => {
  return (
    <Content>
      <Title>{formatMessage('Docker Hub')}</Title>
      <Summary>
        <Text>
          {formatMessage('Select this option when you want to publish your bot to a custom Container Registry')}
        </Text>
      </Summary>
      <Details>
        {/*<Instruction>
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
        </Instruction>*/}
      </Details>
      <Summary>
        <Text>{formatMessage('Once published, your image will be available on your the Registry defined.')}</Text>
      </Summary>
    </Content>
  );
};

// ---------- ChooseProvisionActionStep ---------- //

export const ChooseRegistryAction = ({ choice: controlledChoice, onChoiceChanged }) => {
  const [choice, setChoice] = React.useState(controlledChoice || 'local');

  React.useEffect(() => {
    setChoice(controlledChoice || 'create');
  }, [controlledChoice]);

  React.useEffect(() => {
    onChoiceChanged(choice);
  }, [choice]);

  const renderContent = React.useMemo(() => {
    switch (choice) {
      case 'local':
        return <LocalDockerActionContent />;
      case 'acr':
        return <ACRActionContent />;
      case 'dockerhub':
        return <DockerHubActionContent />;
      case 'custom':
        return <CustomActionContent />;
    }
  }, [choice]);

  return (
    <Root>
      <ChoicesPane>
        <ChoiceGroup
          options={RegistryTypeOptions}
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
