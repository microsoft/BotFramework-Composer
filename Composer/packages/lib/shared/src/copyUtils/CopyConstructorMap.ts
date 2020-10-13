// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/types';

import { copySendActivity } from './copySendActivity';
import { copyInputDialog } from './copyInputDialog';
import { copyIfCondition } from './copyIfCondition';
import { copySwitchCondition } from './copySwitchCondition';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';
import { copyForeach } from './copyForeach';
import { copyEditActions } from './copyEditActions';

const CopyConstructorMap = {
  [SDKKinds.SendActivity]: copySendActivity,
  [SDKKinds.BeginSkill]: copySendActivity,
  [SDKKinds.AttachmentInput]: copyInputDialog,
  [SDKKinds.ChoiceInput]: copyInputDialog,
  [SDKKinds.ConfirmInput]: copyInputDialog,
  [SDKKinds.DateTimeInput]: copyInputDialog,
  [SDKKinds.NumberInput]: copyInputDialog,
  [SDKKinds.TextInput]: copyInputDialog,
  [SDKKinds.IfCondition]: copyIfCondition,
  [SDKKinds.SwitchCondition]: copySwitchCondition,
  [SDKKinds.Foreach]: copyForeach,
  [SDKKinds.ForeachPage]: copyForeach,
  [SDKKinds.EditActions]: copyEditActions,
  default: shallowCopyAdaptiveAction,
};

export default CopyConstructorMap;
