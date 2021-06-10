// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from 'react';
import styled from '@emotion/styled';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import formatMessage from 'format-message';

import { ProvisionAction } from '../types';

// ---------- Styles ---------- //

const ChoicesPane = styled.div`
  height: 100%;
  width: 100%;
`;

type Props = {
  selectedProvisionAction?: ProvisionAction;
  onChangeSelectedProvisionAction: (choice: ProvisionAction) => void;
};

export const ChooseProvisionAction = (props: Props) => {
  const { selectedProvisionAction, onChangeSelectedProvisionAction } = props;

  const choiceOptions = React.useMemo(() => {
    return [
      { key: 'create', text: formatMessage('Create new resources') },
      { key: 'import', text: formatMessage('Import existing resources') },
      { key: 'generate', text: formatMessage('Hand off to admin') },
    ];
  }, []);

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
