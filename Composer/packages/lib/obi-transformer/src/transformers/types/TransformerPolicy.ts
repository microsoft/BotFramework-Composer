import { DirectedGraphNode } from '../../types/DirectedGraphNode';
import { TraceableData } from '../../types/TraceableData';

export type TransformerImpl<T> = (input: TraceableData<T>) => DirectedGraphNode<string, T>;

export type TransformerPolicy = {
  [feature: string]: TransformerImpl<any>;
};
