import { TraceableData } from '../../types/TraceableData';
import { TraceableSelectionResult } from '../../selectors/types/SelectionResult';
import { ConnectorEdge } from './ConnectorResults';
import { StringIndexedCollection } from '../../types/StringIndexedCollection';

type JudgeConnectionHandler<InternalData, ExternalData> = (internal: InternalData, external: ExternalData) => boolean;

type YieldConnectionshandler<InternalData, ExternalData, ConnectionType> = (
  internal: InternalData,
  external: ExternalData
) => ConnectionType[];

type ConnectorUnit<InternalData, ExternalData, ConnectionType> = {
  when: JudgeConnectionHandler<InternalData, ExternalData>;
  buildConnections: YieldConnectionshandler<InternalData, ExternalData, ConnectionType>;
};

type ConnectorPolicy<InternalData, ExternalData, ConnectionType> = StringIndexedCollection<
  ConnectorUnit<InternalData, ExternalData, ConnectionType>
>;

/**
 * Traceable definitions.
 */
export type TraceableWhenHandler<PayloadType> = JudgeConnectionHandler<
  TraceableData<PayloadType>[],
  TraceableSelectionResult<PayloadType>
>;

export type TraceableYieldHandler<InputPayloadType, ConnectionPayloadType> = YieldConnectionshandler<
  TraceableData<InputPayloadType>[],
  TraceableSelectionResult<InputPayloadType>,
  ConnectorEdge<TraceableData<ConnectionPayloadType>>
>;

export type TraceableConnectorUnit<PayloadType> = ConnectorUnit<
  TraceableData<PayloadType>[],
  TraceableSelectionResult<PayloadType>,
  ConnectorEdge<TraceableData<PayloadType>>
>;

export type TraceableConnectorPolicy<InputPayloadType, ConnectionPayloadType> = ConnectorPolicy<
  TraceableData<InputPayloadType>[],
  TraceableSelectionResult<InputPayloadType>,
  ConnectorEdge<TraceableData<ConnectionPayloadType>>
>;
