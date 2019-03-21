import { TraceableData } from '../../analyzers/types/TraceableData';

export class ConnectorEdge {
  from: string;
  to: string;
  why?: any;
  payload?: TraceableData<any>;
}
