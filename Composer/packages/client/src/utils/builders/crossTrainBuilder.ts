// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IPublishConfig } from '@bfc/types';

import { Text, BotStatus } from '../../constants';
import { checkEmptyQuestionOrAnswerInQnAFile } from '../../recoilModel/dispatchers/builder';
import * as luUtil from '../luUtil';
import * as buildUtil from '../buildUtil';
import httpClient from '../httpUtil';
import luFileStatusStorage from '../luFileStatusStorage';
import qnaFileStatusStorage from '../qnaFileStatusStorage';

import { Builder } from './builderTypes';

export const crossTrainBuilder: Builder<IPublishConfig> = async (projectId, config, shellData, setStatus, setError) => {
  const { dialogs, luFiles, qnaFiles } = shellData;
  const referredLuFiles = luUtil.checkLuisBuild(luFiles, dialogs);

  const errorMsg = qnaFiles.reduce(
    (result, file) => {
      if (file.qnaSections && file.qnaSections.length > 0 && checkEmptyQuestionOrAnswerInQnAFile(file.qnaSections)) {
        result.message = result.message + `${file.id}.qna file contains empty answer or questions`;
      }
      return result;
    },
    { title: Text.LUISDEPLOYFAILURE, message: '' }
  );
  if (errorMsg.message) {
    setError(errorMsg);
    setStatus(BotStatus.failed);
    return;
  }
  try {
    //TODO crosstrain should add locale
    const crossTrainConfig = buildUtil.createCrossTrainConfig(dialogs, referredLuFiles);
    await httpClient.post(`/projects/${projectId}/build`, {
      luisConfig: config.luis,
      qnaConfig: config.qna,
      projectId,
      crossTrainConfig,
      luFiles: referredLuFiles.map((file) => file.id),
      qnaFiles: qnaFiles.map((file) => file.id),
    });
    luFileStatusStorage.publishAll(projectId);
    qnaFileStatusStorage.publishAll(projectId);
    setStatus(BotStatus.published);
  } catch (err) {
    setStatus(BotStatus.failed);
    setError({
      title: Text.LUISDEPLOYFAILURE,
      message: err.response?.data?.message || err.message,
    });
  }
};
