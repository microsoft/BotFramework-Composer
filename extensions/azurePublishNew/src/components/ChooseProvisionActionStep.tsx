// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import styled from '@emotion/styled';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { NeutralColors } from '@uifabric/fluent-theme';

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
