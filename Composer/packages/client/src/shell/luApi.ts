// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';
import { LuFile, LuIntentSection } from '@bfc/shared';
import throttle from 'lodash/throttle';
import { useRecoilValue } from 'recoil';

import luWorker from '../recoilModel/parsers/luWorker';
import { projectIdState } from '../recoilModel/atoms/botState';

import { useResolvers } from './../hooks/useRecolver';
import { dispatcherState } from './../recoilModel/DispatcherWrapper';
import { focusPathState } from './../recoilModel/atoms/botState';

const createThrottledFunc = (fn) => throttle(fn, 1000, { leading: true, trailing: true });

function createLuApi(
  state: { focusPath: string; projectId: string },
  actions: any, //TODO
  luFileResolver: (id: string) => LuFile | undefined
) {
  const addLuIntent = async (id: string, intentName: string, intent: LuIntentSection) => {
    const file = luFileResolver(id);
    if (!file) throw new Error(`lu file ${id} not found`);
    if (!intentName) throw new Error(`intentName is missing or empty`);

    const content = await luWorker.addIntent(file.content, intent);
    const projectId = state.projectId;
    return await actions.updateLuFile({ id: file.id, projectId, content });
  };

  const updateLuIntent = async (id: string, intentName: string, intent: LuIntentSection) => {
    const file = luFileResolver(id);
    if (!file) throw new Error(`lu file ${id} not found`);
    if (!intentName) throw new Error(`intentName is missing or empty`);

    const content = await luWorker.updateIntent(file.content, intentName, intent);
    const projectId = state.projectId;
    return await actions.updateLuFile({ id: file.id, projectId, content });
  };

  const removeLuIntent = async (id: string, intentName: string) => {
    const file = luFileResolver(id);
    if (!file) throw new Error(`lu file ${id} not found`);
    if (!intentName) throw new Error(`intentName is missing or empty`);

    const content = await luWorker.removeIntent(file.content, intentName);
    const projectId = state.projectId;
    return await actions.updateLuFile({ id: file.id, projectId, content });
  };

  const getLuIntents = (id: string): LuIntentSection[] => {
    if (id === undefined) throw new Error('must have a file id');
    const focusedDialogId = state.focusPath.split('#').shift() || id;
    const file = luFileResolver(focusedDialogId);
    if (!file) throw new Error(`lu file ${id} not found`);
    return file.intents;
  };

  const getLuIntent = (id: string, intentName: string): LuIntentSection | undefined => {
    const file = luFileResolver(id);
    if (!file) throw new Error(`lu file ${id} not found`);
    return file.intents.find(({ Name }) => Name === intentName);
  };

  return {
    addLuIntent,
    getLuIntents,
    getLuIntent,
    updateLuIntent: createThrottledFunc(updateLuIntent),
    removeLuIntent,
  };
}

export function useLuApi() {
  const focusPath = useRecoilValue(focusPathState);
  const projectId = useRecoilValue(projectIdState);
  const actions = useRecoilValue(dispatcherState);
  const { luFileResolver } = useResolvers();
  const [api, setApi] = useState(createLuApi({ focusPath, projectId }, actions, luFileResolver));

  useEffect(() => {
    const newApi = createLuApi({ focusPath, projectId }, actions, luFileResolver);
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
