import { StringIndexedCollection } from '../../types/StringIndexedCollection';
import { TraceableData } from '../../types/TraceableData';

export class ConnectorEdge<DataType> {
  from: string;
  to: string;
  why?: any;
  payload?: DataType;
}

export type TraceableConnectionResult<PayloadType> = StringIndexedCollection<
  ConnectorEdge<TraceableData<PayloadType>>[]
>;
