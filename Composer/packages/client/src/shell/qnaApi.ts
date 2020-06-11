// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';
import { QnaFile } from '@bfc/shared';

import { State, BoundActionHandlers } from '../store/types';
import { useStoreContext } from '../hooks/useStoreContext';

function createQnaApi(
  state: State,
  actions: BoundActionHandlers,
  qnaFileResolver: (id: string) => QnaFile | undefined
) {
  const updateQnaContentHandler = async (id, content) => {
    const file = qnaFileResolver(id);
    const projectId = state.projectId;
    const updateQnaFile = actions.updateQnaFile;
    if (!file) throw new Error(`qna file ${id} not found`);

    return await updateQnaFile({ id, projectId, content });
  };
  return {
    updateQnaContent: updateQnaContentHandler,
  };
}

export function useQnaApi() {
  const { state, actions, resolvers } = useStoreContext();
  const { projectId, focusPath } = state;
  const { qnaFileResolver } = resolvers;
  const [api, setApi] = useState(createQnaApi(state, actions, qnaFileResolver));

  useEffect(() => {
    const newApi = createQnaApi(state, actions, qnaFileResolver);
    setApi(newApi);

    return () => {
      Object.keys(newApi).forEach((apiName) => {
        if (typeof newApi[apiName].flush === 'function') {
          newApi[apiName].flush();
        }
      });
    };
  }, [projectId, focusPath]);

  return api;
}
