// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selectorFamily } from 'recoil';

import * as buildUtil from './../../utils/buildUtil';
import { luFilesState, settingsState } from './../atoms';
import * as luUtil from './../../utils/luUtil';
import { dialogsSelectorFamily } from './dialogs';

export const crossTrainConfigSelectorFamily = selectorFamily<any, string>({
  key: 'crossTrainConfig',
  get: (projectId: string) => ({ get }) => {
    const dialogs = get(dialogsSelectorFamily(projectId));
    const luFiles = get(luFilesState(projectId));
    const settings = get(settingsState(projectId));
    const referredLuFiles = luUtil.checkLuisBuild(luFiles, dialogs);

    const crossTrainConfig = buildUtil.createCrossTrainConfig(dialogs, referredLuFiles, settings.languages);

    return crossTrainConfig;
  },
});
