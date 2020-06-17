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
var StepsKey = ObiFieldNames.Actions;
export function transformForeach(input, jsonpath) {
  if (!input || (input.$kind !== ObiTypes.Foreach && input.$kind !== ObiTypes.ForeachPage)) return null;
  var foreachDetailNode = new IndexedNode(
    jsonpath,
    __assign(__assign({}, input), {
      $kind: input.$kind === ObiTypes.ForeachPage ? ObiTypes.ForeachPageDetail : ObiTypes.ForeachDetail,
    })
  );
  var steps = input[StepsKey] || [];
  var stepsNode = new IndexedNode(jsonpath + '.' + StepsKey, {
    $kind: ObiTypes.StepGroup,
    children: steps,
  });
  return {
    foreachDetail: foreachDetailNode,
    stepGroup: stepsNode,
    loopBegin: new IndexedNode(jsonpath, { $kind: ObiTypes.LoopIndicator }),
    loopEnd: new IndexedNode(jsonpath, { $kind: ObiTypes.LoopIndicator }),
  };
}
//# sourceMappingURL=transformForeach.js.map
