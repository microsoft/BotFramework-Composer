// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useState } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogWrapper, DialogTypes } from '@bfc/ui-shared';
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';

import { repairSkillDialog } from '../constants';

import { TreeLink } from './ProjectTree/ProjectTree';

export type RepairSkillModalFormData = 'repairSkill' | 'removeSkill';

export interface RepairSkillModalProps {
  skillItem: TreeLink;
  onNext: (option: RepairSkillModalFormData) => void;
  onDismiss: () => void;
}

export const RepairSkillModalOptionKeys = {
  repairSkill: 'repairSkill',
  removeSkill: 'removeSkill',
};

export const RepairSkillModal: React.FC<RepairSkillModalProps> = ({ skillItem, onNext, onDismiss }) => {
  const isRemote = skillItem.isRemote;
  const [option, setOption] = useState<RepairSkillModalFormData>(isRemote ? 'removeSkill' : 'repairSkill');

  if (!skillItem.botError) return null;

  const handleChange = (event, option) => {
    setOption(option.key);
  };

  const handleJumpToNext = () => {
    onNext(option);
  };

  const choiceOptions = [
    {
      ariaLabel:
        formatMessage('Locate the bot file and repair the link') +
        (option === RepairSkillModalOptionKeys.repairSkill ? ' selected' : ''),
      key: RepairSkillModalOptionKeys.repairSkill,
      'data-testid': 'Locate the bot file and repair the link',
      text: formatMessage('Locate the bot file and repair the link'),
      disabled: isRemote,
    },
    {
      ariaLabel:
        formatMessage('Remove this skill from your project') +
        (option === RepairSkillModalOptionKeys.removeSkill ? ' selected' : ''),
      key: RepairSkillModalOptionKeys.removeSkill,
      'data-testid': 'Remove this skill from your project',
      text: formatMessage('Remove this skill from your project'),
    },
  ];

  return (
    <DialogWrapper
      isOpen
      onDismiss={onDismiss}
      {...repairSkillDialog(skillItem.displayName)}
      dialogType={DialogTypes.DesignFlow}
    >
      <form onSubmit={handleJumpToNext}>
        <input style={{ display: 'none' }} type="submit" />
        <ChoiceGroup options={choiceOptions} selectedKey={option} onChange={handleChange} />
        <DialogFooter>
          <DefaultButton text={formatMessage('Cancel')} onClick={onDismiss} />
          <PrimaryButton data-testid="NextStepButton" text={formatMessage('Next')} onClick={handleJumpToNext} />
        </DialogFooter>
      </form>
    </DialogWrapper>
  );
};

export default RepairSkillModal;
