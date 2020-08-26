// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RecoilState } from 'recoil';

import { dialogsState, luFilesState, lgFilesState, projectMetaDataState } from './../atoms/botState';

export type AtomAssetsMap = Map<RecoilState<any>, any>;

export const trackedAtoms = (projectId: string): RecoilState<any>[] => {
  return [dialogsState(projectId), luFilesState(projectId), lgFilesState(projectId), projectMetaDataState(projectId)];
};
