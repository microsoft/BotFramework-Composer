// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import cloneDeep from 'lodash/cloneDeep';
import { SDKKinds } from '@bfc/shared';

import { TriggerOptions, ActivityOptions, EventOptions, qnaMatcherKey, onChooseIntentKey } from './constants';

export const getTriggerOptions = (recognizerType?: SDKKinds): IDropdownOption[] => {
  const triggerTypeOptions = cloneDeep(TriggerOptions);

  if (recognizerType === SDKKinds.RegexRecognizer) {
    const qnaMatcherOption = triggerTypeOptions.find((t) => t.key === qnaMatcherKey);
    if (qnaMatcherOption) {
      qnaMatcherOption.data = { icon: 'Warning' };
    }
    const onChooseIntentOption = triggerTypeOptions.find((t) => t.key === onChooseIntentKey);
    if (onChooseIntentOption) {
      onChooseIntentOption.data = { icon: 'Warning' };
    }
  }
  return triggerTypeOptions;
};

export const getActivityOptions = (): IDropdownOption[] => {
  return cloneDeep(ActivityOptions);
};

export const getEventOptions = (): IDropdownOption[] => {
  return cloneDeep(EventOptions);
};
