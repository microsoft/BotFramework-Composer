// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useRecoilValue } from 'recoil';

import { currentProjectIdState } from '../recoilModel';
import { triggerAutoSave } from '../utils/triggerAutoSave';

export const useAutoSave = () => {
  const currentProjectId = useRecoilValue(currentProjectIdState);

  return async () => triggerAutoSave(currentProjectId);
};
