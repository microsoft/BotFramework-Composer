// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type MapperNull<S, T> = (source: S, target: T | undefined) => T;

export const mapType = <S, T>(mapper: MapperNull<S, T>): MapperNull<ReadonlyArray<S>, ReadonlyArray<T>> => (
  sources,
  targetsOld
) => {
  if (sources === undefined) {
    sources = [];
  }

  if (targetsOld === undefined) {
    targetsOld = [];
  }

  let targetsNew: Array<T> | undefined;
  for (let index = 0; index < sources.length; ++index) {
    const source = sources[index];
    const targetOld = index < targetsOld.length ? targetsOld[index] : undefined;
    const targetNew = mapper(source, targetOld);
    if (targetsNew !== undefined || targetOld !== targetNew) {
      if (targetsNew === undefined) {
        targetsNew = targetsOld.slice();
      }

      targetsNew[index] = targetNew;
    }
  }

  return targetsNew != undefined ? targetsNew : targetsOld;
};

export type ReducerNull<S, A> = (state: S | undefined, action: A) => S;
export type ReducerFull<S, A> = (state: S, action: A) => S;

export const map = <S, A>(reducer: ReducerNull<S, A>): ReducerNull<ReadonlyArray<S>, A> => (sources, action) => {
  if (sources === undefined) {
    sources = [];
  }

  let targets: Array<S> | undefined = undefined;
  for (let index = 0; index < sources.length; ++index) {
    const source = sources[index];
    const target = reducer(source, action);
    if (targets !== undefined || source !== target) {
      if (targets === undefined) {
        targets = sources.slice();
      }

      targets[index] = target;
    }
  }

  return targets != undefined ? targets : sources;
};

export type ReducerByKeyNull<S, A> = {
  [K in keyof S]: ReducerNull<S[K], A>;
};

export type ReducerByKeyFull<S, A> = {
  [K in keyof S]?: ReducerNull<S[K], A>;
};

export const combineFull = <S, A>(reducerByKey: ReducerByKeyFull<S, A>): ReducerFull<S, A> => (sources, action) => {
  let targets = sources;
  for (const key in reducerByKey) {
    const source = sources[key];
    const reducer = reducerByKey[key];
    const target = reducer !== undefined ? reducer(source, action) : source;
    if (source !== target) {
      if (sources === targets) {
        targets = { ...sources };
      }

      targets[key] = target;
    }
  }

  return targets;
};

export const combine = <S, A>(reducerByKey: ReducerByKeyNull<S, A>): ReducerNull<S, A> => {
  const full = combineFull(reducerByKey);

  return (sources, action) => {
    if (sources !== undefined) {
      return full(sources, action);
    }

    const targets: Partial<S> = {};
    for (const key in reducerByKey) {
      const reducer = reducerByKey[key];
      const target = reducer(undefined, action);
      targets[key] = target;
    }

    return targets as S;
  };
};

export const combineSeries = <S, A>(
  reducer: ReducerNull<S, A>,
  ...reducers: Array<ReducerFull<S, A>>
): ReducerNull<S, A> => (state, action) => {
  state = reducer(state, action);

  for (const reducer of reducers) {
    state = reducer(state, action);
  }

  return state;
};
