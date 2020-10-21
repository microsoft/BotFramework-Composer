// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { useRecoilCallback, CallbackInterface } from 'recoil';
import { ILuisConfig, IQnAConfig } from '@bfc/shared';

import * as luUtil from '../../utils/luUtil';
import * as buildUtil from '../../utils/buildUtil';
import { Text, BotStatus } from '../../constants';
import httpClient from '../../utils/httpUtil';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import qnaFileStatusStorage from '../../utils/qnaFileStatusStorage';
import { luFilesState, qnaFilesState, dialogsState, botStatusState, botLoadErrorState } from '../atoms';
import { settingsState } from '../atoms/botState';

const checkEmptyQuestionOrAnswerInQnAFile = (sections) => {
  return sections.some((s) => !s.Answer || s.Questions.some((q) => !q.content));
};

export const builderDispatcher = () => {
  const build = useRecoilCallback(
    ({ set, snapshot }: CallbackInterface) => async (
      luisConfig: ILuisConfig,
      qnaConfig: IQnAConfig,
      recognizerTypes: { [fileName: string]: string },
      projectId: string
    ) => {
      const dialogs = await snapshot.getPromise(dialogsState(projectId));
      const luFiles = await snapshot.getPromise(luFilesState(projectId));
      const qnaFiles = await snapshot.getPromise(qnaFilesState(projectId));
      const settings = await snapshot.getPromise(settingsState(projectId));
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
        set(botLoadErrorState(projectId), errorMsg);
        set(botStatusState(projectId), BotStatus.failed);
        return;
      }
      try {
        const crossTrainConfig = buildUtil.createCrossTrainConfig(dialogs, referredLuFiles, settings.languages);
        await httpClient.post(`/projects/${projectId}/build`, {
          luisConfig,
          qnaConfig,
          projectId,
          crossTrainConfig,
          recognizerTypes,
          luFiles: referredLuFiles.map((file) => ({ id: file.id, isEmpty: file.empty })),
          qnaFiles: qnaFiles.map((file) => ({ id: file.id, isEmpty: !file.qnaSections.length })),
        });
        luFileStatusStorage.publishAll(projectId);
        qnaFileStatusStorage.publishAll(projectId);
        set(botStatusState(projectId), BotStatus.published);
      } catch (err) {
        set(botStatusState(projectId), BotStatus.failed);
        set(botLoadErrorState(projectId), {
          title: Text.LUISDEPLOYFAILURE,
          message: err.response?.data?.message || err.message,
        });
      }
    }
  );
  return {
    build,
  };
};
