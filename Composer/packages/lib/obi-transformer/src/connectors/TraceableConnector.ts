import { ConnectorPolicy } from './types/ConnectionPolicy';
import { TraceableSelectionResult } from '../analyzers/types/SelectionResult';
import { ConnectorEdge } from './types/ConnectorResults';

export class TraceableConnector {
  constructor(private connectorPolicy: ConnectorPolicy) {}

  public buildConnection(input: TraceableSelectionResult): ConnectorEdge[] {
    const topics = Object.keys(this.connectorPolicy);
    const connectionGroups: ConnectorEdge[][] = [];

    for (const key of topics) {
      const { when, buildConnections } = this.connectorPolicy[key];
      const elements = input[key];

      const connectable = when(elements, input);
      if (false === connectable) continue;

      const connections = buildConnections(elements, input);
      connectionGroups.push(connections);
    }

    return connectionGroups.reduce((accumulated, currGroup) => {
      return [...accumulated, ...currGroup];
    }, []);
  }
}
