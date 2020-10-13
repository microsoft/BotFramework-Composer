// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import get from 'lodash/get';
import { SDKKinds } from '@bfc/types';

import { walkAdaptiveAction } from './walkAdaptiveAction';
import { walkAdaptiveActionList } from './walkAdaptiveActionList';

type LgFieldHandler = (actionId: string, lgFieldName: string, lgFieldValue: string) => string;

const findLgFields = (action: any, handleLgField: LgFieldHandler) => {
  if (typeof action === 'string') return;
  if (!action || !action.$kind) return;

  const onFound = (fieldName: string) => {
    action[fieldName] && handleLgField(get(action, '$designer.id', ''), fieldName, action[fieldName]);
  };

  switch (action.$kind) {
    case SDKKinds.SendActivity:
    case SDKKinds.BeginSkill:
      onFound('activity');
      break;
    case SDKKinds.AttachmentInput:
    case SDKKinds.ChoiceInput:
    case SDKKinds.ConfirmInput:
    case SDKKinds.DateTimeInput:
    case SDKKinds.NumberInput:
    case SDKKinds.TextInput:
      onFound('prompt');
      onFound('unrecognizedPrompt');
      onFound('invalidPrompt');
      onFound('defaultValueResponse');
      break;
  }
};

export const walkLgResourcesInAction = (action, handleLgResource: LgFieldHandler) => {
  walkAdaptiveAction(action, (action) => findLgFields(action, handleLgResource));
};

export const walkLgResourcesInActionList = (actionList: any[], handleLgResource: LgFieldHandler) => {
  walkAdaptiveActionList(actionList, (action) => findLgFields(action, handleLgResource));
};
