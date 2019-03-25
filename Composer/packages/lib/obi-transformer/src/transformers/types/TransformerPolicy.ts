import { DirectedGraphNode } from '../../types/DirectedGraphNode';
import { TraceableData } from '../../types/TraceableData';
import { StringIndexedCollection } from '../../types/StringIndexedCollection';

export type TransformerImpl<InputType, OutputType> = (input: InputType) => OutputType;

export type TransformerPolicy<InputType, OutputType> = StringIndexedCollection<TransformerImpl<InputType, OutputType>>;

export type TraceableTransformerPolicy<PayloadType> = TransformerPolicy<
  TraceableData<PayloadType>,
  DirectedGraphNode<string, PayloadType>
>;
