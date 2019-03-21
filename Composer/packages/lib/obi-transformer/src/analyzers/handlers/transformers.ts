import { ObiRule } from '../../models/obi/ObiRule';
import { DirectedGraphNode } from '../../models/graph/DirectedGraphNode';
import { GraphNodeTypes } from '../../models/graph/types/NodeTypes';
import { ObiRecognizer } from '../../models/obi/ObiRecognizer';
import { ObiStorage } from '../../models/obi/ObiStorage';

export type TransformerImpl = (data: any, assignedId: string) => DirectedGraphNode<string, any>;

export const obiRuleToGraphProcess: TransformerImpl = (
  rule: ObiRule,
  assignedId: string
): DirectedGraphNode<string, ObiRule> => {
  return {
    id: assignedId,
    type: GraphNodeTypes.Process,
    neighborIds: [],
    payload: rule,
  } as DirectedGraphNode<string, ObiRule>;
};

export const obiRecognizerToGraphDecision: TransformerImpl = (
  recognizer: ObiRecognizer,
  assignedId: string
): DirectedGraphNode<string, ObiRecognizer> => {
  return {
    id: assignedId,
    type: GraphNodeTypes.Decision,
    neighborIds: [],
    payload: recognizer,
  } as DirectedGraphNode<string, ObiRecognizer>;
};

export const obiWelcomeRuleToGraphTerminator: TransformerImpl = (
  welcome: ObiRule,
  assignedId: string
): DirectedGraphNode<string, ObiRule> => {
  return {
    id: assignedId,
    type: GraphNodeTypes.Terminator,
    neighborIds: [],
    payload: welcome,
  } as DirectedGraphNode<string, ObiRule>;
};

export const obiStorageToGraphIsolated: TransformerImpl = (
  storage: ObiStorage,
  assignedId: string
): DirectedGraphNode<string, ObiStorage> => {
  return {
    id: assignedId,
    type: GraphNodeTypes.Isolated,
    neighborIds: [],
    payload: storage,
  } as DirectedGraphNode<string, ObiStorage>;
};
