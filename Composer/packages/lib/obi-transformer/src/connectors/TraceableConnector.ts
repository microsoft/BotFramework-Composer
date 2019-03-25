import { TraceableConnectorPolicy } from './types/ConnectionPolicy';
import { TraceableSelectionResult } from '../selectors/types/SelectionResult';
import { ConnectorEdge } from './types/ConnectorResults';
import { TraceableData } from '../types/TraceableData';

export class TraceableConnector<InputPayloadType, ConnectionPayloadType> {
  constructor(private connectorPolicy: TraceableConnectorPolicy<InputPayloadType, ConnectionPayloadType>) {}

  public buildConnection(
    input: TraceableSelectionResult<InputPayloadType>
  ): ConnectorEdge<TraceableData<ConnectionPayloadType>>[] {
    const topics = Object.keys(this.connectorPolicy);
    let resultConnections: ConnectorEdge<TraceableData<ConnectionPayloadType>>[] = [];

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
