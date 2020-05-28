// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AdaptiveFieldNames } from '../constants/AdaptiveFieldNames';
import { AdaptiveKinds } from '../constants/AdaptiveKinds';
import { IndexedNode } from '../models/IndexedNode';

const StepsKey = AdaptiveFieldNames.Actions;

export function transformForeach(
  input: any,
  jsonpath: string
): { foreachDetail: IndexedNode; stepGroup: IndexedNode; loopBegin: IndexedNode; loopEnd: IndexedNode } | null {
  if (!input || (input.$kind !== AdaptiveKinds.Foreach && input.$kind !== AdaptiveKinds.ForeachPage)) return null;

  const foreachDetailNode = new IndexedNode(jsonpath, {
    ...input,
    $kind: input.$kind === AdaptiveKinds.ForeachPage ? AdaptiveKinds.ForeachPageDetail : AdaptiveKinds.ForeachDetail,
  });

  const steps = input[StepsKey] || [];
  const stepsNode = new IndexedNode(`${jsonpath}.${StepsKey}`, {
    $kind: AdaptiveKinds.StepGroup,
    children: steps,
  });

  return {
    foreachDetail: foreachDetailNode,
    stepGroup: stepsNode,
    loopBegin: new IndexedNode(jsonpath, { $kind: AdaptiveKinds.LoopIndicator }),
    loopEnd: new IndexedNode(jsonpath, { $kind: AdaptiveKinds.LoopIndicator }),
  };
}
