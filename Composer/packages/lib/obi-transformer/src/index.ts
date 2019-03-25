import { ObiRuleDialogPolicies } from './policies/ObiRuleDialog';
import { TraceableSelector } from './selectors/TraceableSelector';
import { TraceableConnector } from './connectors/TraceableConnector';
import { TraceableTransformer } from './transformers/TraceableTransformer';
import { TraceablePolicy } from './types/TraceablePolicy';
import { DirectedGraphNode } from './types/DirectedGraphNode';
import { ConnectorEdge } from './connectors/types/ConnectorResults';

export class ObiTransformer<InputSchema, NodePayloadType, EdgePayloadType> {
  private selector: TraceableSelector<InputSchema, NodePayloadType>;
  private connector: TraceableConnector<NodePayloadType, EdgePayloadType>;
  private nodeTransformer: TraceableTransformer<NodePayloadType>;
  private edgeTransformer: any;

  constructor(policy: TraceablePolicy<InputSchema, NodePayloadType, EdgePayloadType>) {
    const { selectorPolicy, connectorPolicy, transformerPolicy } = policy;

    this.selector = new TraceableSelector<InputSchema, NodePayloadType>(selectorPolicy);
    this.connector = new TraceableConnector<NodePayloadType, EdgePayloadType>(connectorPolicy);
    this.nodeTransformer = new TraceableTransformer<NodePayloadType>(transformerPolicy);
    // TODO: Implement node transform logic.
    this.edgeTransformer = undefined;
  }

  transform(
    obiInput: InputSchema
  ): {
    nodes: DirectedGraphNode<string, NodePayloadType>[];
    edges: ConnectorEdge<EdgePayloadType>[];
  } {
    const traceableSelections = this.selector.select(obiInput);

    // Build nodes.
    const nodesCollection = this.nodeTransformer.transform(traceableSelections);
    const nodeGroups = Object.values(nodesCollection);
    const nodes = [].concat(...nodeGroups);

    // Build edges.
    const connectionsCollection = this.connector.buildConnections(traceableSelections);
    const connectionGroups = Object.values(connectionsCollection);
    const edges = [].concat(...connectionGroups);

    return {
      nodes,
      edges,
    };
  }
}

export const defaultPolicy = ObiRuleDialogPolicies;
