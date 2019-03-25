import { ObiRule } from '../../../../models/obi/ObiRule';
import { DirectedGraphNode } from '../../../../types/DirectedGraphNode';
import { GraphNodeTypes } from '../../../../types/GraphNodeTypes';
import { ObiRecognizer } from '../../../../models/obi/ObiRecognizer';
import { ObiStorage } from '../../../../models/obi/ObiStorage';
import { TraceableData } from '../../../../types/TraceableData';

export type TransformerImpl<T> = (input: TraceableData<T>) => DirectedGraphNode<string, T>;

export const obiRuleToGraphProcess: TransformerImpl<ObiRule> = (
  input: TraceableData<ObiRule>
): DirectedGraphNode<string, ObiRule> => {
  return {
    id: input.path,
    type: GraphNodeTypes.Process,
    payload: input.data,
  } as DirectedGraphNode<string, ObiRule>;
};

export const obiRecognizerToGraphDecision: TransformerImpl<ObiRecognizer> = (
  input: TraceableData<ObiRecognizer>
): DirectedGraphNode<string, ObiRecognizer> => {
  return {
    id: input.path,
    type: GraphNodeTypes.Decision,
    payload: input.data,
  } as DirectedGraphNode<string, ObiRecognizer>;
};

export const obiWelcomeRuleToGraphTerminator: TransformerImpl<ObiRule> = (
  input: TraceableData<ObiRule>
): DirectedGraphNode<string, ObiRule> => {
  return {
    id: input.path,
    type: GraphNodeTypes.Terminator,
    payload: input.data,
  } as DirectedGraphNode<string, ObiRule>;
};

export const obiStorageToGraphIsolated: TransformerImpl<ObiStorage> = (
  input: TraceableData<ObiStorage>
): DirectedGraphNode<string, ObiStorage> => {
  return {
    id: input.path,
    type: GraphNodeTypes.Isolated,
    payload: input.data,
  } as DirectedGraphNode<string, ObiStorage>;
};
