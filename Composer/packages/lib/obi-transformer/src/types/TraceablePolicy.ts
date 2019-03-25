import { TraceableSelectorPolicy } from '../selectors/types/SelectorPolicy';
import { TraceableData } from './TraceableData';
import { TraceableConnectorPolicy } from '../connectors/types/ConnectionPolicy';
import { TraceableTransformerPolicy } from '../transformers/types/TransformerPolicy';

export type TraceablePolicy<InputSchema, TracedType> = {
  selectorPolicy: TraceableSelectorPolicy<InputSchema, TraceableData<TracedType>>;
  connectorPolicy: TraceableConnectorPolicy<TracedType>;
  transformerPolicy: TraceableTransformerPolicy<TracedType>;
};
