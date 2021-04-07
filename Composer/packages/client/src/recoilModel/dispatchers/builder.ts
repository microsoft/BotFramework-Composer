// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { useRecoilCallback, CallbackInterface } from 'recoil';
import { ILuisConfig, IQnAConfig, IOrchestratorConfig } from '@bfc/shared';

import * as luUtil from '../../utils/luUtil';
import * as qnaUtil from '../../utils/qnaUtil';
import { Text, BotStatus } from '../../constants';
import httpClient from '../../utils/httpUtil';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import qnaFileStatusStorage from '../../utils/qnaFileStatusStorage';
import { botStatusState, botRuntimeErrorState } from '../atoms';
import { dialogsWithLuProviderSelectorFamily, luFilesSelectorFamily, qnaFilesSelectorFamily } from '../selectors';

const checkEmptyQuestionOrAnswerInQnAFile = (sections) => {
  return sections.some((s) => !s.Answer || s.Questions.some((q) => !q.content));
};

export const builderDispatcher = () => {
  const build = useRecoilCallback(
    (callbackHelpers: CallbackInterface) => async (
      projectId: string,
      luisConfig: ILuisConfig,
      qnaConfig: IQnAConfig,
      orchestratorConfig: IOrchestratorConfig
    ) => {
      const { set, snapshot } = callbackHelpers;
      const dialogs = await snapshot.getPromise(dialogsWithLuProviderSelectorFamily(projectId));
      const luFiles = await snapshot.getPromise(luFilesSelectorFamily(projectId));
      const qnaFiles = await snapshot.getPromise(qnaFilesSelectorFamily(projectId));
      const referredLuFiles = luUtil.checkLuisBuild(luFiles, dialogs);
      const referredQnaFiles = qnaUtil.checkQnaBuild(qnaFiles, dialogs);
      const errorMsg = referredQnaFiles.reduce(
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
        set(botRuntimeErrorState(projectId), errorMsg);
        set(botStatusState(projectId), BotStatus.failed);
        return;
      }
      try {
        await httpClient.post(`/projects/${projectId}/build`, {
          luisConfig,
          qnaConfig,
          orchestratorConfig,
          projectId,
          luFiles: referredLuFiles.map((file) => ({ id: file.id, isEmpty: file.empty })),
          qnaFiles: referredQnaFiles.map((file) => ({ id: file.id, isEmpty: file.empty })),
        });
        luFileStatusStorage.publishAll(projectId);
        qnaFileStatusStorage.publishAll(projectId);
        set(botStatusState(projectId), BotStatus.published);
      } catch (err) {
        set(botStatusState(projectId), BotStatus.failed);
        set(botRuntimeErrorState(projectId), {
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
