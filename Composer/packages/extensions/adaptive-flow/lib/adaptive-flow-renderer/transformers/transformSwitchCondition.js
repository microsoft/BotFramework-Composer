// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign, __spreadArrays } from 'tslib';
import { AdaptiveFieldNames } from '../constants/AdaptiveFieldNames';
import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';
import { inheritParentProperties } from './inheritParentProperty';
var ConditionKey = AdaptiveFieldNames.Condition;
var CasesKey = AdaptiveFieldNames.Cases;
var CaseStepKey = AdaptiveFieldNames.Actions;
var DefaultBranchKey = AdaptiveFieldNames.DefaultCase;
export function transformSwitchCondition(input, jsonpath) {
  var _a;
  if (!input || input.$kind !== AdaptiveKinds.SwitchCondition) return null;
  var condition = input[ConditionKey] || '';
  var defaultSteps = input[DefaultBranchKey] || [];
  var cases = input[CasesKey] || [];
  var result = {
    condition: new IndexedNode('' + jsonpath, __assign(__assign({}, input), { $kind: AdaptiveKinds.ConditionNode })),
    choice: new IndexedNode('' + jsonpath, {
      $kind: AdaptiveKinds.ChoiceDiamond,
      text: condition,
    }),
    branches: [],
  };
  result.branches.push(
    new IndexedNode(jsonpath + '.' + DefaultBranchKey, {
      $kind: AdaptiveKinds.StepGroup,
      label: DefaultBranchKey,
      children: defaultSteps,
    })
  );
  if (!cases || !Array.isArray(cases)) return result;
  (_a = result.branches).push.apply(
    _a,
    cases.map(function (_a, index) {
      var value = _a.value,
        actions = _a.actions;
      var prefix = jsonpath + '.' + CasesKey + '[' + index + ']';
      return new IndexedNode(prefix + '.' + CaseStepKey, {
        $kind: AdaptiveKinds.StepGroup,
        label: value,
        children: actions || [],
      });
    })
  );
  inheritParentProperties(input, __spreadArrays([result.condition, result.choice], result.branches));
  return result;
}
//# sourceMappingURL=transformSwitchCondition.js.map
