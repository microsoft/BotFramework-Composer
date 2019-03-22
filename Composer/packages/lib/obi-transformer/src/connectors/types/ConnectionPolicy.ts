import { TraceableData } from '../../types/TraceableData';
import { TraceableSelectionResult } from '../../selectors/types/SelectionResult';
import { ConnectorEdge } from './ConnectorResults';

export type WhenHandler = (self: TraceableData<any>[], root: TraceableSelectionResult) => boolean;
export type YieldHandler = (self: TraceableData<any>[], root: TraceableSelectionResult) => ConnectorEdge[];

export type ConnectorUnit = {
  when: WhenHandler;
  buildConnections: YieldHandler;
};

export type ConnectorPolicy = {
  [feature: string]: ConnectorUnit;
};
