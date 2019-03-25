import { ObiRuleDialogPolicies } from './policies/ObiRuleDialog';
import { TraceableSelector } from './selectors/TraceableSelector';
import { TraceableConnector } from './connectors/TraceableConnector';
import { TraceableTransformer } from './transformers/TraceableTransformer';
import { TraceablePolicy } from './types/TraceablePolicy';

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

  transform(obiInput: InputSchema) {
    const traceableSelections = this.selector.select(obiInput);

    // Build nodes.
    const nodesCollection = this.nodeTransformer.transform(traceableSelections);
    const nodeGroups = Object.values(nodesCollection);
    const nodes = [].concat(...nodeGroups);

    // Build edges.
    const connections = this.connector.buildConnection(traceableSelections);
    const edges = connections;

    return {
      nodes,
      edges,
    };
  }
}

export const defaultPolicy = ObiRuleDialogPolicies;
