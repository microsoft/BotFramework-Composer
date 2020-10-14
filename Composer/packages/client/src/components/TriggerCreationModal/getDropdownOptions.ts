// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import cloneDeep from 'lodash/cloneDeep';
import { SDKKinds } from '@bfc/shared';

import { TriggerOptions, ActivityOptions, EventOptions } from './constants';

export function getTriggerOptions(): IDropdownOption[] {
  return cloneDeep(TriggerOptions);
}

export const getActivityOptions = (): IDropdownOption[] => {
  return cloneDeep(ActivityOptions);
};

export const getEventOptions = (): IDropdownOption[] => {
  return cloneDeep(EventOptions);
};

export const checkTriggerOptions = (
  triggerTypeOptions: IDropdownOption[],
  recognizerType?: SDKKinds
): IDropdownOption[] => {
  if (recognizerType === SDKKinds.RegexRecognizer) {
    const qnaMatcherOption = triggerTypeOptions.find((t) => t.key === SDKKinds.OnQnAMatch);
    if (qnaMatcherOption) {
      qnaMatcherOption.data = { icon: 'Warning' };
    }
    const onChooseIntentOption = triggerTypeOptions.find((t) => t.key === SDKKinds.OnChooseIntent);
    if (onChooseIntentOption) {
      onChooseIntentOption.data = { icon: 'Warning' };
    }
  }
  return triggerTypeOptions;
};
