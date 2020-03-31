// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as redux from 'redux';
export const some = <T>(sources: ReadonlyArray<T> | undefined): ReadonlyArray<T> =>
  sources !== undefined ? sources : [];

export type Mapper<T> = (item: T) => T;

export const map = <T>(selector: Mapper<T>): Mapper<ReadonlyArray<T>> => sources => {
  let targets: Array<T> | undefined = undefined;
  for (let index = 0; index < sources.length; ++index) {
    const source = sources[index];
    const target = selector(source);
    if (targets !== undefined || source !== target) {
      if (targets === undefined) {
        targets = sources.slice();
      }

      targets[index] = target;
    }
  }

  return targets != undefined ? targets : sources;
};

export type PartialReducerMap<S, A extends redux.Action> = Partial<redux.ReducersMapObject<S, A>>;

export const combinePartial = <S, A extends redux.Action>(
  reducersByKey: PartialReducerMap<S, A>
): redux.Reducer<S, A> => (sources, action) => {
  if (sources === undefined) {
    throw new Error();
  }

  let targets: S | undefined = undefined;
  for (const key in sources) {
    const source = sources[key];
    const reducer = reducersByKey[key];
    const target = reducer !== undefined ? reducer(source, action) : source;
    if (targets !== undefined || source !== target) {
      if (targets === undefined) {
        targets = { ...sources };
      }

      targets[key] = target;
    }
  }

  return targets !== undefined ? targets : sources;
};

export const combineSeries = <S, A extends redux.Action>(
  ...reducers: Array<redux.Reducer<S, A>>
): redux.Reducer<S, A> => (state, action) => {
  for (const reducer of reducers) {
    state = reducer(state, action);
  }

  if (state === undefined) {
    throw new Error();
  }

  return state;
};
