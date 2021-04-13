// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@botframework-composer/types';

import {
  AdaptiveDialogSchema,
  IfConditionSchema,
  OnConvUpdateSchema,
  OnDialogEventSchema,
  SwitchConditionSchema,
} from './sdkSchemaMocks';

export const sdkSchemaDefinitionMock = {
  [SDKKinds.SwitchCondition]: SwitchConditionSchema,
  [SDKKinds.IfCondition]: IfConditionSchema,
  [SDKKinds.AdaptiveDialog]: AdaptiveDialogSchema,
  [SDKKinds.OnDialogEvent]: OnDialogEventSchema,
  [SDKKinds.OnConversationUpdateActivity]: OnConvUpdateSchema,
};
