// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { FC, useState } from 'react';
import formatMessage from 'format-message';
import { Stack } from 'office-ui-fabric-react/lib/Stack';
import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown';
import { SDKKinds } from '@bfc/shared';

import { activityTypeKey, dialogEventKey } from './constants';
import { dropdownStyles } from './styles';
import { getEventOptions, getActivityOptions, checkTriggerOptions, getTriggerOptions } from './getDropdownOptions';
import { renderDropdownOption } from './TriggerCreationModal';

export interface TriggerDropwdownGroupProps {
  recognizerType: SDKKinds | undefined;
  triggerType: string;
  setTriggerType: (type: string) => void;
}

export const TriggerDropdownGroup: FC<TriggerDropwdownGroupProps> = ({
  recognizerType,
  triggerType,
  setTriggerType,
}) => {
  const eventTypes: IDropdownOption[] = getEventOptions();
  const activityTypes: IDropdownOption[] = getActivityOptions();
  const triggerTypeOptions: IDropdownOption[] = getTriggerOptions();

  // Mark out incompatible triggers of current recognizer
  checkTriggerOptions(triggerTypeOptions, recognizerType);

  const [rootKey, setRootKey] = useState(triggerType);
  const [childKey, setChildKey] = useState('');

  const showEventDropDown = rootKey === dialogEventKey;
  const showActivityDropDown = rootKey === activityTypeKey;

  const compoundTypes = [activityTypeKey, dialogEventKey];
  const onSelectTriggerType = (e, option) => {
    const type = option.key;
    setRootKey(type);
    setChildKey('');
    const isCompound = compoundTypes.some((t) => type === t);
    setTriggerType(isCompound ? '' : type);
  };
  const onChangeChildKey = (e, option) => {
    setChildKey(option.key);
    setTriggerType(option.key);
  };

  return (
    <Stack>
      <Dropdown
        data-testid={'triggerTypeDropDown'}
        label={formatMessage('What is the type of this trigger?')}
        options={triggerTypeOptions}
        selectedKey={rootKey}
        styles={dropdownStyles}
        onChange={onSelectTriggerType}
        onRenderOption={renderDropdownOption}
      />
      {showEventDropDown && (
        <Dropdown
          data-testid={'eventTypeDropDown'}
          label={formatMessage('Which event?')}
          options={eventTypes}
          placeholder={formatMessage('Select an event type')}
          selectedKey={childKey}
          styles={dropdownStyles}
          onChange={onChangeChildKey}
        />
      )}
      {showActivityDropDown && (
        <Dropdown
          data-testid={'activityTypeDropDown'}
          label={formatMessage('Which activity type?')}
          options={activityTypes}
          placeholder={formatMessage('Select an activity type')}
          selectedKey={childKey}
          styles={dropdownStyles}
          onChange={onChangeChildKey}
        />
      )}
    </Stack>
  );
};
