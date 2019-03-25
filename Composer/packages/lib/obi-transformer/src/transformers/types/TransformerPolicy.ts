import { DirectedGraphNode } from '../../types/DirectedGraphNode';
import { TraceableData } from '../../types/TraceableData';
import { StringIndexedCollection } from '../../types/StringIndexedCollection';

type TransformerImpl<InputType, OutputType> = (input: InputType) => OutputType;

type TransformerPolicy<InputType, OutputType> = StringIndexedCollection<TransformerImpl<InputType, OutputType>>;

/**
 * Traceable transformer types definition.
 */
export type TraceableTransformerImpl<PayloadType> = TransformerImpl<
  TraceableData<PayloadType>,
  DirectedGraphNode<string, PayloadType>
>;

export type TraceableTransformerPolicy<PayloadType> = TransformerPolicy<
  TraceableData<PayloadType>,
  DirectedGraphNode<string, PayloadType>
>;
