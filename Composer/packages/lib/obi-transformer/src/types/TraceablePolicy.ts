import { TraceableSelectorPolicy } from '../selectors/types/SelectorPolicy';
import { TraceableConnectorPolicy } from '../connectors/types/ConnectionPolicy';
import { TraceableTransformerPolicy } from '../transformers/types/TransformerPolicy';

export type TraceablePolicy<InputSchema, NodePayloadType, EdgePayloadType> = {
  selectorPolicy: TraceableSelectorPolicy<InputSchema, NodePayloadType>;
  connectorPolicy: TraceableConnectorPolicy<NodePayloadType, EdgePayloadType>;
  transformerPolicy: TraceableTransformerPolicy<NodePayloadType>;
};
