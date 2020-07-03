// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SDKKinds } from '@bfc/shared';

enum VirtualElementTypes {
  RuleGroup = 'VisualSDK.RuleGroup',
  StepGroup = 'VisualSDK.StepGroup',
  ChoiceDiamond = 'VisualSDK.ChoiceDiamond',
  ConditionNode = 'VisualSDK.ConditionNode',
  LoopIndicator = 'VisualSDK.LoopIndicator',
  ForeachDetail = 'VisualSDK.ForeachDetail',
  ForeachPageDetail = 'VisualSDK.ForeachPageDetail',
  BotAsks = 'VisualSDK.BotAsks',
  UserAnswers = 'VisualSDK.UserAnswers',
  InvalidPromptBrick = 'VisualSDK.InvalidPromptBrick',
  ChoiceInputDetail = 'VisualSDK.ChoiceInputDetail',
}

export const AdaptiveKinds = {
  ...SDKKinds,
  ...VirtualElementTypes,
};
