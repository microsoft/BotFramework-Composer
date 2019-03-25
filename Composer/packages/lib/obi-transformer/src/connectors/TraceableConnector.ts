import { TraceableConnectorPolicy } from './types/ConnectionPolicy';
import { TraceableSelectionResult } from '../selectors/types/SelectionResult';
import { TraceableConnectionResult } from './types/ConnectorResults';

export class TraceableConnector<InputPayloadType, ConnectionPayloadType> {
  constructor(private connectorPolicy: TraceableConnectorPolicy<InputPayloadType, ConnectionPayloadType>) {}

  public buildConnections(
    input: TraceableSelectionResult<InputPayloadType>
  ): TraceableConnectionResult<ConnectionPayloadType> {
    const topics = Object.keys(this.connectorPolicy);
    const result: TraceableConnectionResult<ConnectionPayloadType> = {};

    for (const key of topics) {
      const { when, buildConnections } = this.connectorPolicy[key];
      const elements = input[key];

      const connectable = when(elements, input);
      if (!connectable) continue;

      const newConnections = buildConnections(elements, input);
      result[key] = newConnections;
    }

    return result;
  }
}
