// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecoilState } from 'recoil';

import {
  dialogsSelectorFamily,
  lgFilesSelectorFamily,
  luFilesSelectorFamily,
  qnaFilesSelectorFamily,
} from '../selectors';

export type AtomAssetsMap = Map<RecoilState<any>, any>;

export const trackedAtoms = (projectId: string): RecoilState<any>[] => {
  return [
    dialogsSelectorFamily(projectId),
    luFilesSelectorFamily(projectId),
    lgFilesSelectorFamily(projectId),
    qnaFilesSelectorFamily(projectId),
  ];
};
