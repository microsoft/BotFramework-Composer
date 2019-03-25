import { TraceableConnectorPolicy } from './types/ConnectionPolicy';
import { TraceableSelectionResult } from '../selectors/types/SelectionResult';
import { ConnectorEdge } from './types/ConnectorResults';
import { TraceableData } from '../types/TraceableData';

export class TraceableConnector<PayloadType> {
  constructor(private connectorPolicy: TraceableConnectorPolicy<PayloadType>) {}

  public buildConnection(input: TraceableSelectionResult<PayloadType>): ConnectorEdge<TraceableData<PayloadType>>[] {
    const topics = Object.keys(this.connectorPolicy);
    let resultConnections: ConnectorEdge<TraceableData<PayloadType>>[] = [];

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
