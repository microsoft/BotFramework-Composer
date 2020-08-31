// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';
import { QnAFile } from '@bfc/shared';
import { useRecoilValue } from 'recoil';

import { useResolvers } from '../hooks/useResolver';
import { projectIdState } from '../recoilModel/atoms';

import { dispatcherState } from './../recoilModel/DispatcherWrapper';

function createQnaApi(state: { projectId }, dispatchers: any, qnaFileResolver: (id: string) => QnAFile | undefined) {
  const updateQnaContentHandler = async (id, content) => {
    const file = qnaFileResolver(id);
    const projectId = state.projectId;
    if (!file) throw new Error(`qna file ${id} not found`);

    return await dispatchers.updateQnAFile({ id, projectId, content });
  };
  return {
    updateQnaContent: updateQnaContentHandler,
  };
}

export function useQnaApi() {
  const projectId = useRecoilValue(projectIdState);
  const dispatchers = useRecoilValue(dispatcherState);
  const { qnaFileResolver } = useResolvers();
  const [api, setApi] = useState(createQnaApi({ projectId }, dispatchers, qnaFileResolver));

  useEffect(() => {
    const newApi = createQnaApi({ projectId }, dispatchers, qnaFileResolver);
    setApi(newApi);

    return () => {
      Object.keys(newApi).forEach((apiName) => {
        if (typeof newApi[apiName].flush === 'function') {
          newApi[apiName].flush();
        }
      });
    };
  }, [projectId]);

  return api;
}
