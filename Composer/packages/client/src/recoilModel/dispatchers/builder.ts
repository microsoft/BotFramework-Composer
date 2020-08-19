// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { useRecoilCallback, CallbackInterface } from 'recoil';

import * as luUtil from '../../utils/luUtil';
import { Text, BotStatus } from '../../constants';
import httpClient from '../../utils/httpUtil';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import qnaFileStatusStorage from '../../utils/qnaFileStatusStorage';
import { luFilesState, qnaFilesState, dialogsState, botStatusState, botLoadErrorState } from '../atoms';

const checkEmptyQuestionOrAnswerInQnAFile = (sections) => {
  return sections.some((s) => !s.Answer || s.Questions.some((q) => !q.content));
};

export const builderDispatcher = () => {
  const build = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (
      authoringKey: string,
      subscriptionKey: string,
      qnaRegion: string,
      projectId: string
    ) => {
      const dialogs = await snapshot.getPromise(dialogsState);
      const luFiles = await snapshot.getPromise(luFilesState);
      const qnaFiles = await snapshot.getPromise(qnaFilesState);
      const referredLuFiles = luUtil.checkLuisBuild(luFiles, dialogs);

      const errorMsg = qnaFiles.reduce(
        (result, file) => {
          if (
            file.qnaSections &&
            file.qnaSections.length > 0 &&
            checkEmptyQuestionOrAnswerInQnAFile(file.qnaSections)
          ) {
            result.message = result.message + `${file.id}.qna file contains empty answer or questions`;
          }
          return result;
        },
        { title: Text.LUISDEPLOYFAILURE, message: '' }
      );
      if (errorMsg.message) {
        set(botLoadErrorState, errorMsg);
        set(botStatusState, BotStatus.failed);
        return;
      }
      try {
        //TODO crosstrain should add locale
        const crossTrainConfig = luUtil.createCrossTrainConfig(dialogs, referredLuFiles);
        await httpClient.post(`/projects/${projectId}/build`, {
          authoringKey,
          subscriptionKey,
          qnaRegion,
          projectId,
          crossTrainConfig,
          luFiles: referredLuFiles.map((file) => file.id),
          qnaFiles: qnaFiles.map((file) => file.id),
        });
        luFileStatusStorage.publishAll(projectId);
        qnaFileStatusStorage.publishAll(projectId);
        set(botStatusState, BotStatus.published);
      } catch (err) {
        set(botStatusState, BotStatus.failed);
        set(botLoadErrorState, { title: Text.LUISDEPLOYFAILURE, message: err.response?.data?.message || err.message });
      }
    }
  );
  return {
    build,
  };
};
