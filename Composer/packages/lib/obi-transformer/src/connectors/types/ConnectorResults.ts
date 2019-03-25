export class ConnectorEdge<DataType> {
  from: string;
  to: string;
  why?: any;
  payload?: DataType;
}
