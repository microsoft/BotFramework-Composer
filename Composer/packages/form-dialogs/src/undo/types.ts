// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-explicit-any */

import { RecoilState, Snapshot, Loadable } from 'recoil';

export type History = {
  past: Snapshot[];
  present: Snapshot;
  future: Snapshot[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AtomMap = Map<RecoilState<any>, Loadable<any>>;
