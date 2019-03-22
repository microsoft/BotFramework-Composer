import { ObiSchema } from './models/obi/ObiSchema';

import { ObiRuleDialogPolicies } from './policies/ObiRuleDialog';
import { TraceableSelector } from './analyzers/TraceableSelector';
import { TraceableConnector } from './connectors/TraceableConnector';
import { TraceableTransformer } from './transformers/TraceableTransformer';
import { flatten } from './utils/flatten';
import { DirectedGraphNode } from './models/graph/DirectedGraphNode';
import { ConnectorEdge } from './connectors/types/ConnectorResults';

const { analyzerPolicy, connectorPolicy, transformerPolicy } = ObiRuleDialogPolicies;

const analyzer = new TraceableSelector(analyzerPolicy);
const connector = new TraceableConnector(connectorPolicy);
const transformer = new TraceableTransformer(transformerPolicy);

export function transform(obiJson: ObiSchema) {
  const traceableData = analyzer.select(obiJson);

  const nodeGroups = transformer.transform(traceableData);
  const nodes: DirectedGraphNode<string, any>[] = flatten(Object.values(nodeGroups));
  const edges: ConnectorEdge[] = connector.buildConnection(traceableData);

  return {
    nodes,
    edges,
  };
}
