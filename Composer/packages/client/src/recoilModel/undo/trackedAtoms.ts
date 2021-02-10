// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecoilState } from 'recoil';

import { luFilesState } from '../atoms';
import { dialogsSelectorFamily } from '../selectors';
import { lgFilesSelectorFamily } from '../selectors/lg';

export type AtomAssetsMap = Map<RecoilState<any>, any>;

export const trackedAtoms = (projectId: string): RecoilState<any>[] => {
  return [dialogsSelectorFamily(projectId), luFilesState(projectId), lgFilesSelectorFamily(projectId)];
};
