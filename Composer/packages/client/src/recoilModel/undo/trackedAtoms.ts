// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecoilState } from 'recoil';

import { dialogsState, luFilesState, lgFilesState } from './../atoms/botState';

export type AtomAssetsMap = Map<RecoilState<any>, any>;

export const trackedAtoms = (projectId: string) => {
  return [dialogsState(projectId), luFilesState(projectId), lgFilesState(projectId)];
};
