// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
var __spreadArrays =
  (this && this.__spreadArrays) ||
  function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
    return r;
  };
import { ObiFieldNames } from '../constants/ObiFieldNames';
import { ObiTypes } from '../constants/ObiTypes';
import { IndexedNode } from '../models/IndexedNode';
import { normalizeObiStep } from '../utils/stepBuilder';
var Events = ObiFieldNames.Events,
  Actions = ObiFieldNames.Actions;
function transformSimpleDialog(input) {
  if (!input) return null;
  var rules = input[Events] || [];
  var steps = input[Actions] || [];
  var ruleGroup = new IndexedNode(Events, {
    $kind: ObiTypes.RuleGroup,
    children: __spreadArrays(rules),
  });
  var stepGroup = new IndexedNode(Actions, {
    $kind: ObiTypes.StepGroup,
    children: steps.map(function (x) {
      return normalizeObiStep(x);
    }),
  });
  return {
    ruleGroup: ruleGroup,
    stepGroup: stepGroup,
  };
}
export function transformRootDialog(input) {
  return transformSimpleDialog(input);
}
//# sourceMappingURL=transformRootDialog.js.map
