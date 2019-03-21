import { TraceableData } from '../../analyzers/types/TraceableData';
import { TraceableAnalyzerResult } from '../../analyzers/types/AnalyzerResult';
import { ConnectorEdge } from './ConnectorEdge';

export type WhenHandler = (self: TraceableData<any>[], root: TraceableAnalyzerResult) => boolean;
export type YieldHandler = (self: TraceableData<any>[], root: TraceableAnalyzerResult) => ConnectorEdge[];

export type ConnectionPolicy = {
  when: WhenHandler;
  buildConnections: YieldHandler;
};

export type ConnectionPolicyCollection = {
  [feature: string]: ConnectionPolicy;
};
