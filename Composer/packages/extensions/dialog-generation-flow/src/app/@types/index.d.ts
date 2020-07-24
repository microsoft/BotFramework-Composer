// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

type ThemeName = 'light' | 'dark';

interface NodeRequire {
  <T>(path: string): T;
}

interface NodeModule {
  hot: any;
}

interface Function {
  displayName?: string;
}

type DeepNoFunction<T> = T extends Function
  ? unknown
  : T extends readonly any[]
  ? DeepNoFunctionArray<T[number]>
  : T extends MapLike<infer U>
  ? DeepNoFunctionMap<U>
  : T extends object
  ? DeepNoFunctionObject<T>
  : T;

type DeepNoFunctionArray<T> = ReadonlyArray<DeepNoFunction<T>>;

type DeepNoFunctionObject<T> = { [P in keyof T]: DeepNoFunction<T[P]> };

type MapLike<U> = {
  get: (key: string) => U;
  values: () => IterableIterator<U>;
  keys: () => IterableIterator<string>;
  entries: () => IterableIterator<[string, U]>;
};

type DeepNoFunctionMap<U> = {
  get: (key: string) => DeepNoFunction<U>;
  keys: () => IterableIterator<string>;
  values: () => IterableIterator<DeepNoFunction<U>>;
  entries: () => IterableIterator<[string, DeepNoFunction<U>]>;
};

declare let module: NodeModule;
declare let require: NodeRequire;
