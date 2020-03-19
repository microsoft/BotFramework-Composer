// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as redux from 'redux';

import * as values from './values';

export const map = <S, A extends redux.Action>(inner: redux.Reducer<S, A>): redux.Reducer<ReadonlyArray<S>, A> => (
  sources,
  action
) => {
  if (sources === undefined) {
    return [];
  }

  let targets: Array<S> | undefined = undefined;
  for (let index = 0; index < sources.length; ++index) {
    const source = sources[index];
    const target = inner(source, action);
    if (targets !== undefined || source !== target) {
      if (targets === undefined) {
        targets = sources.slice();
      }

      targets[index] = target;
    }
  }

  return targets != undefined ? targets : sources;
};

export const sort = <S, A extends redux.Action>(
  inner: redux.Reducer<ReadonlyArray<S>, A>,
  compare: values.Compare<S>
): redux.Reducer<ReadonlyArray<S>, A> => (sources, action) => {
  const targets = inner(sources, action);
  if (!values.isSorted(targets, compare)) {
    const sorted = Array.from(targets);
    sorted.sort(compare);
    return sorted;
  }

  return targets;
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

export const optimize = <S, A extends redux.Action>(inner: redux.Reducer<S, A>): redux.Reducer<S, A> => (
  source,
  action
) => {
  const target = inner(source, action);
  if (source === undefined) {
    return target;
  }

  if (source !== target && values.deepEquals(source, target)) {
    return source;
  }

  return target;
};

export const validate = <S, A extends redux.Action>(inner: redux.Reducer<S, A>): redux.Reducer<S, A> => (
  source,
  action
) => {
  const target = inner(source, action);
  if (!Object.is(source, target) && values.deepEquals(source, target)) {
    throw new Error();
  }

  return target;
};
