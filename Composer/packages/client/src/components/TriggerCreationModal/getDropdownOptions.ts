// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import cloneDeep from 'lodash/cloneDeep';

import { TriggerOptions, ActivityOptions, EventOptions } from './constants';

export const getTriggerOptions = (): IDropdownOption[] => {
  return cloneDeep(TriggerOptions);
};

export const getActivityOptions = (): IDropdownOption[] => {
  return cloneDeep(ActivityOptions);
};

export const getEventOptions = (): IDropdownOption[] => {
  return cloneDeep(EventOptions);
};
