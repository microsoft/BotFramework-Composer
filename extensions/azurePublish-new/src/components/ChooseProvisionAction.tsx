// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { RecoilRoot } from 'recoil';

import { CreateResourcesWizard } from './provisioningWizards/CreateResourcesWizard';
import { ImportResourcesWizard } from './provisioningWizards/ImportResourcesWizard';
import { HandOffToAdminWizard } from './provisioningWizards/HandOffToAdminWizard';

// ---------- Styles ---------- //

export const Root = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-columns: 30% 1fr;
  grid-template-rows: 1fr;
`;

export const ChoicesPane = styled.div`
  height: 100%;
  width: 100%;
`;

export const ContentPane = styled(Stack)`
  border-left: 1px solid ${NeutralColors.gray30};
  height: 100%;
  overflow-y: auto;
`;

export const Content = styled(Stack)`
  padding: 0px 20px;
`;

export const Title = styled(Text)`
  font-size: ${FluentTheme.fonts.xLarge.fontSize};
  margin: 8px 0;
`;

export const Summary = styled.div`
  margin: 8px 0;
`;

export const Details = styled(Stack)`
  margin: 10px 0;
`;

export const Instruction = styled(Stack)`
  margin: 10px 0;
`;

export const InstructionTitle = styled(Text)`
  font-size: ${FluentTheme.fonts.smallPlus.fontSize};
  text-transform: uppercase;
`;

export const InstructionDetails = styled.div`
  margin: 10px 0;
`;

export const ResourceTitle = styled(Stack)`
  margin: 4px 0;
`;

export const LearnMoreLink = styled(Link)`
  user-select: none;
  font-size: 14px;
`;

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
  const [choice, setChoice] = useState(controlledChoice || 'create');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  useEffect(() => {
    setChoice(controlledChoice || 'create');
  }, [controlledChoice]);

  useEffect(() => {
    onChoiceChanged(choice);
  }, [choice]);
  const handleStepChange = (stepName: string, index: number) => {
    setActiveStepIndex(index);
    console.log('step changed');
  };
  const renderContent = React.useMemo(() => {
    switch (choice) {
      case 'create':
        return <CreateResourcesWizard onStepChange={handleStepChange} />;
      case 'import':
        return <ImportResourcesWizard />;
      case 'generate':
        return <HandOffToAdminWizard />;
    }
  }, [choice]);

  return (
    <RecoilRoot>
      <Root>
        <ChoicesPane style={{ display: activeStepIndex === 0 ? undefined : 'none' }}>
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
    </RecoilRoot>
  );
};
