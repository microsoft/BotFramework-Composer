import { ObiSchema } from './models/obi/ObiSchema';

import { ObiRuleDialogPolicies } from './policies/ObiRuleDialog';
import { TraceableAnalyzer } from './analyzers/TraceableAnalyzer';
import { TraceableConnector } from './connectors/TraceableConnector';
import { TraceableTransformer } from './transformers/TraceableTransformer';
import { flatten } from './utils/flatten';

const { analyzerPolicy, connectorPolicy, transformerPolicy } = ObiRuleDialogPolicies;

const analyzer = new TraceableAnalyzer(analyzerPolicy);
const connector = new TraceableConnector(connectorPolicy);
const transformer = new TraceableTransformer(transformerPolicy);

export function transform(obiJson: ObiSchema) {
  const traceableData = analyzer.analyze(obiJson);

  const edges = connector.buildConnection(traceableData);

  const nodeGroups = transformer.transform(traceableData);
  const nodes = flatten(Object.values(nodeGroups));

  return {
    nodes,
    edges,
  };
}
