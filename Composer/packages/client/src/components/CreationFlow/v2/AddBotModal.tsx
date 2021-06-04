// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { DialogTypes, DialogWrapper } from '@bfc/ui-shared';
import formatMessage from 'format-message';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { useRecoilValue } from 'recoil';

import { colors } from '../../../colors';
import { dispatcherState } from '../../../recoilModel';
import { CreationFlowStatus } from '../../../constants';

interface AddBotModalProps {
  onDismiss: () => void;
}

const addExistingBotKey = 'existing';
const addNewBotKey = 'new';

const getAddSkillOptions = (): IChoiceGroupOption[] => [
  { key: addNewBotKey, text: formatMessage('Create a new bot') },
  { key: addExistingBotKey, text: formatMessage('Add an existing bot') },
];

export const AddBotModal: React.FC<AddBotModalProps> = (props) => {
  const { setCreationFlowStatus } = useRecoilValue(dispatcherState);
  const [addBotType, setAddBotType] = useState(addNewBotKey);

  const handleChange = (ev?, option?: IChoiceGroupOption): void => {
    if (option) {
      setAddBotType(option.key);
    }
  };

  const handleSubmit = () => {
    if (addBotType === addExistingBotKey) {
      setCreationFlowStatus(CreationFlowStatus.OPEN);
    } else {
      setCreationFlowStatus(CreationFlowStatus.NEW);
    }
  };

  return (
    <DialogWrapper
      isOpen
      dialogType={DialogTypes.DesignFlow}
      subText={formatMessage('Which bot would you like to add to your project')}
      title={formatMessage('Add a bot')}
      onDismiss={props.onDismiss}
    >
      <ChoiceGroup required defaultSelectedKey={addNewBotKey} options={getAddSkillOptions()} onChange={handleChange} />
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} theme={colors.fluentTheme} onClick={props.onDismiss} />
        <PrimaryButton
          data-testid="NextStepButton"
          text={formatMessage('Next')}
          theme={colors.fluentTheme}
          onClick={handleSubmit}
        />
      </DialogFooter>
    </DialogWrapper>
  );
};
