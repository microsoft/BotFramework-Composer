import { ObiFieldNames } from '../constants/ObiFieldNames';
import { ObiTypes } from '../constants/ObiTypes';
import { IndexedNode } from '../models/IndexedNode';

const StepsKey = ObiFieldNames.Actions;

export function transformForeach(
  input: any,
  jsonpath: string
): { foreachDetail: IndexedNode; stepGroup: IndexedNode; loopBegin: IndexedNode; loopEnd: IndexedNode } | null {
  if (!input || (input.$type !== ObiTypes.Foreach && input.$type !== ObiTypes.ForeachPage)) return null;

  const foreachDetailNode = new IndexedNode(jsonpath, {
    ...input,
    $type: input.$type === ObiTypes.ForeachPage ? ObiTypes.ForeachPageDetail : ObiTypes.ForeachDetail,
  });

  const steps = input[StepsKey] || [];
  const stepsNode = new IndexedNode(`${jsonpath}.${StepsKey}`, {
    $type: ObiTypes.StepGroup,
    children: steps,
  });

  return {
    foreachDetail: foreachDetailNode,
    stepGroup: stepsNode,
    loopBegin: new IndexedNode(jsonpath, { $type: ObiTypes.LoopIndicator }),
    loopEnd: new IndexedNode(jsonpath, { $type: ObiTypes.LoopIndicator }),
  };
}
