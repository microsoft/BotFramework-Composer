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
var IfBranchKey = ObiFieldNames.Actions;
var ElseBranchKey = ObiFieldNames.ElseActions;
export function transformIfCondtion(input, jsonpath) {
  if (!input || input.$kind !== ObiTypes.IfCondition) return null;
  var result = {
    condition: new IndexedNode('' + jsonpath, __assign(__assign({}, input), { $kind: ObiTypes.ConditionNode })),
    choice: new IndexedNode('' + jsonpath, {
      $kind: ObiTypes.ChoiceDiamond,
      text: input.condition,
    }),
    ifGroup: new IndexedNode(jsonpath + '.' + IfBranchKey, {
      $kind: ObiTypes.StepGroup,
      children: input[IfBranchKey] || [],
    }),
    elseGroup: new IndexedNode(jsonpath + '.' + ElseBranchKey, {
      $kind: ObiTypes.StepGroup,
      children: input[ElseBranchKey] || [],
    }),
  };
  return result;
}
//# sourceMappingURL=transformIfCondition.js.map
