/**
 * TraceableData requires the data records where itself came from.
 * Typically, we use jsonpath to trace a data section.
 */
export type TraceableData<T> = {
  data: T;
  path: string;
};
