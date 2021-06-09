// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import styled from '@emotion/styled';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';

import { ProvisionAction } from '../types';

// ---------- Styles ---------- //

const ChoicesPane = styled.div`
  height: 100%;
  width: 100%;
`;

const choiceOptions: IChoiceGroupOption[] = [
  { key: 'create', text: 'Create new resources' },
  { key: 'import', text: 'Import existing resources' },
  { key: 'generate', text: 'Hand off to admin' },
];

type Props = {
  selectedProvisionAction?: ProvisionAction;
  onChangeSelectedProvisionAction: (choice: ProvisionAction) => void;
  showChoices: boolean;
};

export const ChooseProvisionAction = (props: Props) => {
  const { selectedProvisionAction, onChangeSelectedProvisionAction } = props;
  return (
    <ChoicesPane>
      <ChoiceGroup
        options={choiceOptions}
        selectedKey={selectedProvisionAction}
        onChange={(_, option) => {
          onChangeSelectedProvisionAction(option.key as ProvisionAction);
        }}
      />
    </ChoicesPane>
  );
};
