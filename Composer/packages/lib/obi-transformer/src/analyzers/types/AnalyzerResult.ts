import { TraceableData } from './TraceableData';

export type AnalyzerResult<T> = { [feature: string]: T[] };

export type TraceableAnalyzerResult = AnalyzerResult<TraceableData<any>>;
