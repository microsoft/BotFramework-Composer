import { ObiRule } from '../../../types/obi-elements/ObiRule';
import { DirectedGraphNode } from '../../../../types/DirectedGraphNode';
import { GraphNodeTypes } from '../../../../types/GraphNodeTypes';
import { ObiRecognizer } from '../../../types/obi-elements/ObiRecognizer';
import { ObiStorage } from '../../../types/obi-elements/ObiStorage';
import { TraceableTransformerImpl } from '../../../../transformers/types/TransformerPolicy';

export const obiRuleToGraphProcess: TraceableTransformerImpl<ObiRule> = input => {
  return {
    id: input.path,
    type: GraphNodeTypes.Process,
    payload: input.data,
  } as DirectedGraphNode<string, ObiRule>;
};

export const obiRecognizerToGraphDecision: TraceableTransformerImpl<ObiRecognizer> = input => {
  return {
    id: input.path,
    type: GraphNodeTypes.Decision,
    payload: input.data,
  } as DirectedGraphNode<string, ObiRecognizer>;
};

export const obiWelcomeRuleToGraphTerminator: TraceableTransformerImpl<ObiRule> = input => {
  return {
    id: input.path,
    type: GraphNodeTypes.Terminator,
    payload: input.data,
  } as DirectedGraphNode<string, ObiRule>;
};

export const obiStorageToGraphIsolated: TraceableTransformerImpl<ObiStorage> = input => {
  return {
    id: input.path,
    type: GraphNodeTypes.Isolated,
    payload: input.data,
  } as DirectedGraphNode<string, ObiStorage>;
};
