import { ObiTypes } from '../shared/ObiTypes';

import { FlowBaseNode, FlowGroup, DecisionNode, LoopNode } from './LogicFlowNodes';

export const parseAdaptiveDialog = (json: any): FlowBaseNode => {
  const steps = json.steps || [];
  return new FlowGroup(`steps`, steps, '', steps.map((x, index) => parseObiJson(x, `steps[${index}]`)));
};

const parseIfCondition = (json: any, basePath: string): FlowBaseNode => {
  return new DecisionNode(basePath, json, [
    new FlowGroup(
      `${basePath}.elseSteps`,
      json.elseSteps || [],
      'False',
      (json.elseSteps || []).map((x, index) => parseObiJson(x, `${basePath}.elseSteps[${index}]`))
    ),
    new FlowGroup(
      `${basePath}.steps`,
      json.steps || [],
      'True',
      (json.steps || []).map((x, index) => parseObiJson(x, `${basePath}.steps[${index}]`))
    ),
  ]);
};

const parseSwitchCondition = (json: any, basePath: string): FlowBaseNode => {
  return new DecisionNode(
    basePath,
    json,
    (json.cases || []).map(
      (caseBranch, index) =>
        new FlowGroup(
          `${basePath}.cases[${index}]`,
          caseBranch,
          caseBranch.value,
          (caseBranch.steps || []).map((x, i) => parseObiJson(x, `${basePath}.cases[${index}].steps[${i}]`))
        )
    )
  );
};

const parseForeach = (json: any, basePath: string): FlowBaseNode => {
  const steps = json.steps || [];
  return new LoopNode(
    basePath,
    json,
    new FlowGroup(`${basePath}.steps`, steps, '', steps.map((x, i) => parseObiJson(x, `${basePath}.steps[${i}]`)))
  );
};

function parseObiJson(json: any, path: string): FlowBaseNode | undefined {
  if (!json || !json.$type) return;

  switch (json.$type) {
    case ObiTypes.AdaptiveDialog:
      return parseAdaptiveDialog(json);
    case ObiTypes.IfCondition:
      return parseIfCondition(json, path);
    case ObiTypes.SwitchCondition:
      return parseSwitchCondition(json, path);
    case ObiTypes.Foreach:
    case ObiTypes.ForeachPage:
      return parseForeach(json, path);
    default:
      return new FlowBaseNode(path, json);
  }
}
