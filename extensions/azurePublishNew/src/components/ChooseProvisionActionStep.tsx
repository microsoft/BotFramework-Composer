// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import styled from '@emotion/styled';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { Text } from 'office-ui-fabric-react/lib/Text';
import { FluentTheme, NeutralColors } from '@uifabric/fluent-theme';
import { Link } from 'office-ui-fabric-react/lib/Link';

import { ProvisionAction } from '../types';

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

const choiceOptions: IChoiceGroupOption[] = [
  { key: 'create', text: 'Create new resources' },
  { key: 'import', text: 'Import existing resources' },
  { key: 'generate', text: 'Hand off to admin' },
];

type Props = {
  selectedProvisionAction?: ProvisionAction;
  onChangeSelectedProvisionAction: (choice: ProvisionAction) => void;
  children: React.ReactNode;
  showChoices: boolean;
};

export const ChooseProvisionAction = (props: Props) => {
  const { selectedProvisionAction, onChangeSelectedProvisionAction, showChoices, children } = props;
  return (
    <>
      {showChoices ? (
        <Root>
          <ChoicesPane>
            <ChoiceGroup
              options={choiceOptions}
              selectedKey={selectedProvisionAction}
              onChange={(_e, option) => {
                onChangeSelectedProvisionAction(option.key as ProvisionAction);
              }}
            />
          </ChoicesPane>
          <ContentPane>{children}</ContentPane>
        </Root>
      ) : (
        children
      )}
    </>
  );
};
