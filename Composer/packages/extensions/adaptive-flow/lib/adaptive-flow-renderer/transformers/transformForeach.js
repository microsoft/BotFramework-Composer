// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { __assign } from 'tslib';
import { AdaptiveFieldNames } from '../constants/AdaptiveFieldNames';
import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';
import { inheritParentProperties } from './inheritParentProperty';
var StepsKey = AdaptiveFieldNames.Actions;
export function transformForeach(input, jsonpath) {
  if (!input || (input.$kind !== AdaptiveKinds.Foreach && input.$kind !== AdaptiveKinds.ForeachPage)) return null;
  var foreachDetailNode = new IndexedNode(
    jsonpath,
    __assign(__assign({}, input), {
      $kind: input.$kind === AdaptiveKinds.ForeachPage ? AdaptiveKinds.ForeachPageDetail : AdaptiveKinds.ForeachDetail,
    })
  );
  var steps = input[StepsKey] || [];
  var stepsNode = new IndexedNode(jsonpath + '.' + StepsKey, {
    $kind: AdaptiveKinds.StepGroup,
    children: steps,
  });
  var result = {
    foreachDetail: foreachDetailNode,
    stepGroup: stepsNode,
    loopBegin: new IndexedNode(jsonpath, { $kind: AdaptiveKinds.LoopIndicator }),
    loopEnd: new IndexedNode(jsonpath, { $kind: AdaptiveKinds.LoopIndicator }),
  };
  inheritParentProperties(input, Object.values(result));
  return result;
}
//# sourceMappingURL=transformForeach.js.map
