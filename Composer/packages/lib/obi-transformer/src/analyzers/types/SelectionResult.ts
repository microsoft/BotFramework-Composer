import { TraceableData } from '../../types/TraceableData';

export type SelectionResult<T> = { [feature: string]: T[] };

export type TraceableSelectionResult = SelectionResult<TraceableData<any>>;
