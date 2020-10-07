// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { RecoilState, Snapshot, Loadable } from 'recoil';

export type History = {
  past: { snapshot: Snapshot; trackedAtoms: RecoilState<any>[] }[];
  present: { snapshot: Snapshot; trackedAtoms: RecoilState<any>[] };
  future: { snapshot: Snapshot; trackedAtoms: RecoilState<any>[] }[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AtomMap = Map<RecoilState<any>, Loadable<any>>;
