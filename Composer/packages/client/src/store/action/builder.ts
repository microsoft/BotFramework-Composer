// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as luUtil from '../../utils/luUtil';
import { Text } from '../../constants';
import { ActionCreator } from '../types';
import httpClient from '../../utils/httpUtil';
import { ActionTypes } from '../../constants/index';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import qnaFileStatusStorage from '../../utils/qnaFileStatusStorage';

export const build: ActionCreator = async ({ dispatch, getState }, authoringKey, subscriptKey, projectId) => {
  try {
    const { dialogs, luFiles, qnaFiles } = getState();
    const referredLuFiles = luUtil.checkLuisBuild(luFiles, dialogs);
    //TODO crosstrain should add locale
    const crossTrainConfig = luUtil.createCrossTrainConfig(dialogs, referredLuFiles);
    const response = await httpClient.post(`/projects/${projectId}/build`, {
      authoringKey,
      subscriptKey,
      projectId,
      crossTrainConfig,
      luFiles: referredLuFiles.map((file) => file.id),
      qnaFiles: qnaFiles.map((file) => file.id),
    });
    luFileStatusStorage.publishAll(getState().projectId);
    qnaFileStatusStorage.publishAll(getState().projectId);
    dispatch({
      type: ActionTypes.BUILD_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.BUILD_SUCCCESS,
      payload: { title: Text.LUISDEPLOYFAILURE, message: err.response?.data?.message || err.message },
    });
  }
};
