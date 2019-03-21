import { ObiRule } from '../../models/obi/ObiRule';
import { DirectedGraphNode } from '../../models/graph/DirectedGraphNode';
import { GraphNodeTypes } from '../../models/graph/types/NodeTypes';
import { ObiRecognizer } from '../../models/obi/ObiRecognizer';
import { ObiStorage } from '../../models/obi/ObiStorage';
import { TraceableData } from '../../analyzers/types/TraceableData';

export type TransformerImpl<T> = (input: TraceableData<T>) => DirectedGraphNode<string, T>;

export const obiRuleToGraphProcess: TransformerImpl<ObiRule> = (
  input: TraceableData<ObiRule>
): DirectedGraphNode<string, ObiRule> => {
  return {
    id: input.path,
    type: GraphNodeTypes.Process,
    neighborIds: [],
    payload: input.data,
  } as DirectedGraphNode<string, ObiRule>;
};

export const obiRecognizerToGraphDecision: TransformerImpl<ObiRecognizer> = (
  input: TraceableData<ObiRecognizer>
): DirectedGraphNode<string, ObiRecognizer> => {
  return {
    id: input.path,
    type: GraphNodeTypes.Decision,
    neighborIds: [],
    payload: input.data,
  } as DirectedGraphNode<string, ObiRecognizer>;
};

export const obiWelcomeRuleToGraphTerminator: TransformerImpl<ObiRule> = (
  input: TraceableData<ObiRule>
): DirectedGraphNode<string, ObiRule> => {
  return {
    id: input.path,
    type: GraphNodeTypes.Terminator,
    neighborIds: [],
    payload: input.data,
  } as DirectedGraphNode<string, ObiRule>;
};

export const obiStorageToGraphIsolated: TransformerImpl<ObiStorage> = (
  input: TraceableData<ObiStorage>
): DirectedGraphNode<string, ObiStorage> => {
  return {
    id: input.path,
    type: GraphNodeTypes.Isolated,
    neighborIds: [],
    payload: input.data,
  } as DirectedGraphNode<string, ObiStorage>;
};
