// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { ObiFieldNames } from '../constants/ObiFieldNames';
import { ObiTypes } from '../constants/ObiTypes';
import { IndexedNode } from '../models/IndexedNode';
import { normalizeObiStep } from '../utils/stepBuilder';
export function transformObiRules(input, parentPath) {
  if (parentPath === void 0) {
    parentPath = '';
  }
  if (!input) return null;
  var prefix = parentPath ? parentPath + '.' : '';
  var steps = input[ObiFieldNames.Actions] || [];
  var stepGroup = new IndexedNode('' + prefix + ObiFieldNames.Actions, {
    $kind: ObiTypes.StepGroup,
    children: steps.map(function (x) {
      return normalizeObiStep(x);
    }),
  });
  return {
    stepGroup: stepGroup,
  };
}
//# sourceMappingURL=transformObiRules.js.map
