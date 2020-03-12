// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { walkAdaptiveAction } from '../deleteUtils/walkAdaptiveAction';
import { SDKTypes } from '../types';
import { walkAdaptiveActionList } from '../deleteUtils/walkAdaptiveActionList';

type LgFieldHandler = (action, lgFieldName: string, lgString: string) => any;

const findLgFields = (action: any, handleLgField: LgFieldHandler) => {
  if (typeof action === 'string') return;
  if (!action || !action.$type) return;

  const onFound = (fieldName: string) => {
    action[fieldName] && handleLgField(action, fieldName, action[fieldName]);
  };

  switch (action.$type) {
    case SDKTypes.SendActivity:
      onFound('activity');
      break;
    case SDKTypes.AttachmentInput:
    case SDKTypes.ChoiceInput:
    case SDKTypes.ConfirmInput:
    case SDKTypes.DateTimeInput:
    case SDKTypes.NumberInput:
    case SDKTypes.TextInput:
      onFound('prompt');
      onFound('unrecognizedPrompt');
      onFound('invalidPrompt');
      onFound('defaultValueResponse');
      break;
  }
};

export const walkLgResourcesInAction = (action, handleLgResource: LgFieldHandler) => {
  walkAdaptiveAction(action, action => findLgFields(action, handleLgResource));
};

export const walkLgResourcesInActionList = (actioList: any[], handleLgResource: LgFieldHandler) => {
  walkAdaptiveActionList(actioList, action => findLgFields(action, handleLgResource));
};
