import { TraceableData } from '../../types/TraceableData';
import { StringIndexedCollection } from '../../types/StringIndexedCollection';

type SelectionResult<T> = StringIndexedCollection<T[]>;

export type TraceableSelectionResult<PayloadType> = StringIndexedCollection<TraceableData<PayloadType>[]>;
