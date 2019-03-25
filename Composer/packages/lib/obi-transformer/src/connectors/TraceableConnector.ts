import { ConnectorPolicy } from './types/ConnectionPolicy';
import { TraceableSelectionResult } from '../selectors/types/SelectionResult';
import { ConnectorEdge } from './types/ConnectorResults';

export class TraceableConnector {
  constructor(private connectorPolicy: ConnectorPolicy) {}

  public buildConnection(input: TraceableSelectionResult): ConnectorEdge[] {
    const topics = Object.keys(this.connectorPolicy);
    let resultConnections: ConnectorEdge[] = [];

    for (const key of topics) {
      const { when, buildConnections } = this.connectorPolicy[key];
      const elements = input[key];

      const connectable = when(elements, input);
      if (!connectable) continue;

      const newConnections = buildConnections(elements, input);
      resultConnections = resultConnections.concat(newConnections);
    }

    return resultConnections;
  }
}
