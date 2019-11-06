// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKTypes } from '../types/schema';

import { ExternalApi } from './ExternalApi';
import { copySendActivity } from './copySendActivity';
import { copyInputDialog } from './copyInputDialog';
import { copyIfCondition } from './copyIfCondition';
import { copySwitchCondition } from './copySwitchCondition';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';
import { copyForeach } from './copyForeach';
import { copyEditActions } from './copyEditActions';

const CopyConstructorMap = {
  [SDKTypes.SendActivity]: copySendActivity,
  [SDKTypes.AttachmentInput]: copyInputDialog,
  [SDKTypes.ChoiceInput]: copyInputDialog,
  [SDKTypes.ConfirmInput]: copyInputDialog,
  [SDKTypes.DateTimeInput]: copyInputDialog,
  [SDKTypes.NumberInput]: copyInputDialog,
  [SDKTypes.TextInput]: copyInputDialog,
  [SDKTypes.IfCondition]: copyIfCondition,
  [SDKTypes.SwitchCondition]: copySwitchCondition,
  [SDKTypes.Foreach]: copyForeach,
  [SDKTypes.ForeachPage]: copyForeach,
  [SDKTypes.EditActions]: copyEditActions,
};

const DEFAULT_COPIER = shallowCopyAdaptiveAction;

export async function copyAdaptiveAction(data, externalApi: ExternalApi) {
  if (!data || !data.$type) return {};

  const copier = CopyConstructorMap[data.$type] || DEFAULT_COPIER;

  return await copier(data, externalApi);
}
