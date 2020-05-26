// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ObiFieldNames } from '../../constants/ObiFieldNames';
import { ObiTypes } from '../../constants/ObiTypes';
import { IndexedNode } from '../models/IndexedNode';

const StepsKey = ObiFieldNames.Actions;

export function transformForeach(
  input: any,
  jsonpath: string
): { foreachDetail: IndexedNode; stepGroup: IndexedNode; loopBegin: IndexedNode; loopEnd: IndexedNode } | null {
  if (!input || (input.$kind !== ObiTypes.Foreach && input.$kind !== ObiTypes.ForeachPage)) return null;

  const foreachDetailNode = new IndexedNode(jsonpath, {
    ...input,
    $kind: input.$kind === ObiTypes.ForeachPage ? ObiTypes.ForeachPageDetail : ObiTypes.ForeachDetail,
  });

  const steps = input[StepsKey] || [];
  const stepsNode = new IndexedNode(`${jsonpath}.${StepsKey}`, {
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
