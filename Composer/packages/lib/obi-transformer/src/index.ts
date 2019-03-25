import { ObiRuleDialog } from './policies/types/obi-dialogs/ObiRuleDialog';

import { ObiRuleDialogPolicies } from './policies/ObiRuleDialog';
import { TraceableSelector } from './selectors/TraceableSelector';
import { TraceableConnector } from './connectors/TraceableConnector';
import { TraceableTransformer } from './transformers/TraceableTransformer';
import { DirectedGraphNode } from './types/DirectedGraphNode';
import { ConnectorEdge } from './connectors/types/ConnectorResults';
import { TraceableData } from './types/TraceableData';

const { selectorPolicy, connectorPolicy, transformerPolicy } = ObiRuleDialogPolicies;

const selector = new TraceableSelector<ObiRuleDialog, any>(selectorPolicy);
const connector = new TraceableConnector<any>(connectorPolicy);
const transformer = new TraceableTransformer<any>(transformerPolicy);

export function transform(obiJson: ObiRuleDialog) {
  const traceableData = selector.select(obiJson);

  const nodesCollection: { [key: string]: DirectedGraphNode<string, any>[] } = transformer.transform(traceableData);
  const nodeGroups: DirectedGraphNode<string, any>[][] = Object.values(nodesCollection);

  const nodes: DirectedGraphNode<string, any>[] = [].concat(...nodeGroups);
  const edges: ConnectorEdge<TraceableData<any>>[] = connector.buildConnection(traceableData);

  return {
    nodes,
    edges,
  };
}
