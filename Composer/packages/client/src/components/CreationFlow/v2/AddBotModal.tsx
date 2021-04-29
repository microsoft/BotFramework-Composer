// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import { DialogTypes, DialogWrapper } from '@bfc/ui-shared';
import formatMessage from 'format-message';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { useRecoilValue } from 'recoil';

import { dispatcherState } from '../../../recoilModel';
import { CreationFlowStatus } from '../../../constants';

interface AddBotModalProps {
  onDismiss: () => void;
}

const addExistingKey = 'existing';
const addBlankKey = 'blank';

const addSkillOptions: IChoiceGroupOption[] = [
  { key: addExistingKey, text: 'Add an existing bot' },
  { key: addBlankKey, text: 'Create a new blank bot' },
];

export const AddBotModal: React.FC<AddBotModalProps> = (props) => {
  const { setCreationFlowStatus } = useRecoilValue(dispatcherState);
  const [addBotType, setAddBotType] = useState(addExistingKey);

  const handleChange = (ev?, option?: IChoiceGroupOption): void => {
    if (option) {
      setAddBotType(option.key);
    }
  };

  const handleSubmit = () => {
    if (addBotType === addExistingKey) {
      setCreationFlowStatus(CreationFlowStatus.OPEN);
    } else {
      setCreationFlowStatus(CreationFlowStatus.NEW_FROM_TEMPLATE);
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
      <ChoiceGroup required defaultSelectedKey={addExistingKey} options={addSkillOptions} onChange={handleChange} />
      <DialogFooter>
        <DefaultButton text={formatMessage('Cancel')} onClick={props.onDismiss} />
        <PrimaryButton data-testid="NextStepButton" text={formatMessage('Next')} onClick={handleSubmit} />
      </DialogFooter>
    </DialogWrapper>
  );
};
