// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign } from 'tslib';
import { SDKKinds } from '@bfc/shared';
var VirtualElementTypes;
(function (VirtualElementTypes) {
  VirtualElementTypes['RuleGroup'] = 'VisualSDK.RuleGroup';
  VirtualElementTypes['StepGroup'] = 'VisualSDK.StepGroup';
  VirtualElementTypes['ChoiceDiamond'] = 'VisualSDK.ChoiceDiamond';
  VirtualElementTypes['ConditionNode'] = 'VisualSDK.ConditionNode';
  VirtualElementTypes['LoopIndicator'] = 'VisualSDK.LoopIndicator';
  VirtualElementTypes['ForeachDetail'] = 'VisualSDK.ForeachDetail';
  VirtualElementTypes['ForeachPageDetail'] = 'VisualSDK.ForeachPageDetail';
  VirtualElementTypes['BotAsks'] = 'VisualSDK.BotAsks';
  VirtualElementTypes['UserAnswers'] = 'VisualSDK.UserAnswers';
  VirtualElementTypes['InvalidPromptBrick'] = 'VisualSDK.InvalidPromptBrick';
  VirtualElementTypes['ChoiceInputDetail'] = 'VisualSDK.ChoiceInputDetail';
})(VirtualElementTypes || (VirtualElementTypes = {}));
export var AdaptiveKinds = __assign(__assign({}, SDKKinds), VirtualElementTypes);
//# sourceMappingURL=AdaptiveKinds.js.map
