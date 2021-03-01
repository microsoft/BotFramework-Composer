// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AdaptiveFieldNames } from '../constants/AdaptiveFieldNames';
import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';

import { inheritParentProperties } from './inheritParentProperty';

const StepsKey = AdaptiveFieldNames.Actions;

export function transformForeach(
  input: any,
  jsonpath: string
): { foreachDetail: IndexedNode; stepGroup: IndexedNode; loopBegin: IndexedNode; loopEnd: IndexedNode } | null {
  if (!input || typeof input !== 'object') return null;

  const foreachDetailNode = new IndexedNode(jsonpath, {
    ...input,
    $kind: AdaptiveKinds.ConditionNode,
  });

  const steps = input[StepsKey] || [];
  const stepsNode = new IndexedNode(`${jsonpath}.${StepsKey}`, {
    $kind: AdaptiveKinds.StepGroup,
    children: steps,
  });

  const result = {
    foreachDetail: foreachDetailNode,
    stepGroup: stepsNode,
    loopBegin: new IndexedNode(jsonpath, { $kind: AdaptiveKinds.LoopIndicator }),
    loopEnd: new IndexedNode(jsonpath, { $kind: AdaptiveKinds.LoopIndicator }),
  };

  inheritParentProperties(input, Object.values(result));
  return result;
}
