// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
export var ObiTypes = __assign(__assign({}, SDKKinds), VirtualElementTypes);
//# sourceMappingURL=ObiTypes.js.map
