// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKTypes } from '../types/schema';

import { copySendActivity } from './copySendActivity';
import { copyInputDialog } from './copyInputDialog';
import { copyIfCondition } from './copyIfCondition';
import { copySwitchCondition } from './copySwitchCondition';
import { shallowCopyAdaptiveAction } from './shallowCopyAdaptiveAction';
import { copyForeach } from './copyForeach';
import { copyEditActions } from './copyEditActions';

const CopyConstructorMap = {
  [SDKTypes.SendActivity]: copySendActivity,
  [SDKTypes.SkillDialog]: copySendActivity,
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
  default: shallowCopyAdaptiveAction,
};

export default CopyConstructorMap;
