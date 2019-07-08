import { ObiTypes } from '../shared/ObiTypes';

import { IndexedNode } from './models/IndexedNode';

const StepsKey = 'steps';
export function transformForeach(input: any, jsonpath: string) {
  if (!input || (input.$type !== ObiTypes.Foreach && input.$type !== ObiTypes.ForeachPage)) return {};

  const foreachDetailNode = new IndexedNode(jsonpath, {
    ...input,
    $type: input.$type === ObiTypes.ForeachPage ? ObiTypes.ForeachPageDetail : ObiTypes.ForeachDetail,
  });

  const steps = input[StepsKey] || [];
  const stepsNode = new IndexedNode(`${jsonpath}.steps`, {
    $type: ObiTypes.StepGroup,
    children: steps.map((x, index) => new IndexedNode(`${jsonpath}.steps[${index}]`, x)),
  });

  return {
    foreachDetail: foreachDetailNode,
    stepGroup: stepsNode,
    loopBegin: new IndexedNode(jsonpath, { $type: ObiTypes.LoopIndicator }),
    loopEnd: new IndexedNode(jsonpath, { $type: ObiTypes.LoopIndicator }),
  };
}
