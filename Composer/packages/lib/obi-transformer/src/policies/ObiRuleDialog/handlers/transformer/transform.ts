import { ObiRule } from '../../../types/obi-elements/ObiRule';
import { DirectedGraphNode } from '../../../../types/DirectedGraphNode';
import { GraphNodeTypes } from '../../../../types/GraphNodeTypes';
import { ObiRecognizer } from '../../../types/obi-elements/ObiRecognizer';
import { ObiStorage } from '../../../types/obi-elements/ObiStorage';
import { TraceableData } from '../../../../types/TraceableData';
import { TransformerImpl } from '../../../../transformers/types/TransformerPolicy';

export const obiRuleToGraphProcess: TransformerImpl<
  TraceableData<ObiRule>,
  DirectedGraphNode<string, ObiRule>
> = input => {
  return {
    id: input.path,
    type: GraphNodeTypes.Process,
    payload: input.data,
  } as DirectedGraphNode<string, ObiRule>;
};

export const obiRecognizerToGraphDecision: TransformerImpl<
  TraceableData<ObiRecognizer>,
  DirectedGraphNode<string, ObiRecognizer>
> = input => {
  return {
    id: input.path,
    type: GraphNodeTypes.Decision,
    payload: input.data,
  } as DirectedGraphNode<string, ObiRecognizer>;
};

export const obiWelcomeRuleToGraphTerminator: TransformerImpl<
  TraceableData<ObiRule>,
  DirectedGraphNode<string, ObiRule>
> = input => {
  return {
    id: input.path,
    type: GraphNodeTypes.Terminator,
    payload: input.data,
  } as DirectedGraphNode<string, ObiRule>;
};

export const obiStorageToGraphIsolated: TransformerImpl<
  TraceableData<ObiStorage>,
  DirectedGraphNode<string, ObiStorage>
> = input => {
  return {
    id: input.path,
    type: GraphNodeTypes.Isolated,
    payload: input.data,
  } as DirectedGraphNode<string, ObiStorage>;
};
