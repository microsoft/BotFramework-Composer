// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import get from 'lodash/get';

import { walkAdaptiveAction } from '../deleteUtils/walkAdaptiveAction';
import { SDKTypes } from '../types';

type LgFieldHandler = (nodeId: string, lgType: string, lgString: string) => any;

const findLgFields = (action: any, handleLgField: LgFieldHandler) => {
  if (typeof action === 'string') return;
  if (!action || !action.$type) return;

  const actionId = get(action, '$designer.id', '');
  const onFound = (fieldName: string) => {
    action[fieldName] && handleLgField(actionId, fieldName, action[fieldName]);
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

export const walkLgResources = (action, handleLgResource: LgFieldHandler) => {
  walkAdaptiveAction(action, action => findLgFields(action, handleLgResource));
};
