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
import { ObiFieldNames } from '../constants/ObiFieldNames';
import { ObiTypes } from '../constants/ObiTypes';
import { IndexedNode } from '../models/IndexedNode';
var ConditionKey = ObiFieldNames.Condition;
var CasesKey = ObiFieldNames.Cases;
var CaseStepKey = ObiFieldNames.Actions;
var DefaultBranchKey = ObiFieldNames.DefaultCase;
export function transformSwitchCondition(input, jsonpath) {
  var _a;
  if (!input || input.$kind !== ObiTypes.SwitchCondition) return null;
  var condition = input[ConditionKey] || '';
  var defaultSteps = input[DefaultBranchKey] || [];
  var cases = input[CasesKey] || [];
  var result = {
    condition: new IndexedNode('' + jsonpath, __assign(__assign({}, input), { $kind: ObiTypes.ConditionNode })),
    choice: new IndexedNode('' + jsonpath, {
      $kind: ObiTypes.ChoiceDiamond,
      text: condition,
    }),
    branches: [],
  };
  result.branches.push(
    new IndexedNode(jsonpath + '.' + DefaultBranchKey, {
      $kind: ObiTypes.StepGroup,
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
        $kind: ObiTypes.StepGroup,
        label: value,
        children: actions || [],
      });
    })
  );
  return result;
}
//# sourceMappingURL=transformSwitchCondition.js.map
