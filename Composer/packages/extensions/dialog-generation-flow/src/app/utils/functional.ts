// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export type Arity1<A, O> = (a: A) => O;

export type Arity2<A, B, O> = (a: A, b: B) => O;

export type Arity3<A, B, C, O> = (a: A, b: B, c: C) => O;

export type Arity4<A, B, C, D, O> = (a: A, b: B, c: C, d: D) => O;

export type Arity5<A, B, C, D, E, O> = (a: A, b: B, c: C, d: D, e: E) => O;

export type Arity6<A, B, C, D, E, F, O> = (a: A, b: B, c: C, d: D, e: E, f: F) => O;

export function partial<A, O>(fn: Arity1<A, O>, a: A): () => O;

export function partial<A, B, O>(fn: Arity2<A, B, O>, a: A): (b: B) => O;
export function partial<A, B, O>(fn: Arity2<A, B, O>, a: A, b: B): () => O;

export function partial<A, B, C, O>(fn: Arity3<A, B, C, O>, a: A): (b: B, c: C) => O;
export function partial<A, B, C, O>(fn: Arity3<A, B, C, O>, a: A, b: B): (c: C) => O;
export function partial<A, B, C, O>(fn: Arity3<A, B, C, O>, a: A, b: B, c: C): () => O;

export function partial<A, B, C, D, O>(fn: Arity4<A, B, C, D, O>, a: A): (b: B, c: C, d: D) => O;
export function partial<A, B, C, D, O>(fn: Arity4<A, B, C, D, O>, a: A, b: B): (c: C, d: D) => O;
export function partial<A, B, C, D, O>(fn: Arity4<A, B, C, D, O>, a: A, b: B, c: C): (d: D) => O;
export function partial<A, B, C, D, O>(fn: Arity4<A, B, C, D, O>, a: A, b: B, c: C, d: D): () => O;

export function partial<A, B, C, D, E, O>(fn: Arity5<A, B, C, D, E, O>, a: A): (b: B, c: C, d: D, e: E) => O;
export function partial<A, B, C, D, E, O>(fn: Arity5<A, B, C, D, E, O>, a: A, b: B): (c: C, d: D, e: E) => O;
export function partial<A, B, C, D, E, O>(fn: Arity5<A, B, C, D, E, O>, a: A, b: B, c: C): (d: D, e: E) => O;
export function partial<A, B, C, D, E, O>(fn: Arity5<A, B, C, D, E, O>, a: A, b: B, c: C, d: D): (e: E) => O;
export function partial<A, B, C, D, E, O>(fn: Arity5<A, B, C, D, E, O>, a: A, b: B, c: C, d: D, e: E): () => O;

export function partial<A, B, C, D, E, F, O>(fn: Arity6<A, B, C, D, E, F, O>, a: A): (b: B, c: C, d: D, e: E) => O;
export function partial<A, B, C, D, E, F, O>(fn: Arity6<A, B, C, D, E, F, O>, a: A, b: B): (c: C, d: D, e: E) => O;
export function partial<A, B, C, D, E, F, O>(fn: Arity6<A, B, C, D, E, F, O>, a: A, b: B, c: C): (d: D, e: E) => O;
export function partial<A, B, C, D, E, F, O>(fn: Arity6<A, B, C, D, E, F, O>, a: A, b: B, c: C, d: D): (e: E) => O;
export function partial<A, B, C, D, E, F, O>(
  fn: Arity6<A, B, C, D, E, F, O>,
  a: A,
  b: B,
  c: C,
  d: D,
  e: E
): (f: F) => O;

export function partial(fn: Function, ...partials: {}[]) {
  return (...args: {}[]) => {
    return fn.apply(null, [...partials, ...args]);
  };
}
