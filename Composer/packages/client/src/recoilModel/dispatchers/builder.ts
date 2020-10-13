// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
/* eslint-disable react-hooks/rules-of-hooks */

import { useRecoilCallback, CallbackInterface } from 'recoil';
import { IPublishConfig, ShellData } from '@bfc/types';

import { botStatusState, botLoadErrorState } from '../atoms';
import { Builder } from '../../utils/builders/builderTypes';

export const checkEmptyQuestionOrAnswerInQnAFile = (sections) => {
  return sections.some((s) => !s.Answer || s.Questions.some((q) => !q.content));
};

export const builderDispatcher = () => {
  const build = useRecoilCallback(
    ({ set }: CallbackInterface) => (
      projectId: string,
      config: IPublishConfig,
      shellData: ShellData,
      builder: Builder<any>
    ) => {
      return builder(
        projectId,
        config,
        shellData,
        (status) => set(botStatusState(projectId), status),
        (error) => set(botLoadErrorState(projectId), error)
      );
    }
  );
  return {
    build,
  };
};
