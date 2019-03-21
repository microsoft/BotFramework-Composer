import { ConnectionPolicyCollection } from './types/ConnectionPolicy';
import { TraceableAnalyzerResult } from '../analyzers/types/AnalyzerResult';
import { ConnectorEdge } from './types/ConnectorEdge';

export class TraceableConnector {
  constructor(private connectorPolicy: ConnectionPolicyCollection) {}

  public buildConnection(input: TraceableAnalyzerResult): ConnectorEdge[] {
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
