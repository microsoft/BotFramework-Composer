// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { useEffect, useState } from 'react';
import { LuFile, LuIntentSection } from '@bfc/shared';
import { useRecoilValue } from 'recoil';
import formatMessage from 'format-message';
import debounce from 'lodash/debounce';

import { useResolvers } from '../hooks/useResolver';
import { focusPathState } from '../recoilModel';
import { Dispatcher } from '../recoilModel/dispatchers';

import { dispatcherState } from './../recoilModel/DispatcherWrapper';

const fileNotFound = (id: string) => formatMessage(`LU file {id} not found`, { id });
const INTENT_ERROR = formatMessage('intentName is missing or empty');

function createLuApi(
  state: { focusPath: string; projectId: string },
  dispatchers: Dispatcher,
  luFileResolver: (id: string) => LuFile | undefined
) {
  const addLuIntent = async (id: string, intentName: string, intent: LuIntentSection) => {
    const file = luFileResolver(id);
    if (!file) throw new Error(fileNotFound(id));
    if (!intentName) throw new Error(INTENT_ERROR);

    return await dispatchers.createLuIntent({ id: file.id, intent, projectId: state.projectId });
  };

  const updateLuIntent = async (id: string, intentName: string, intent: LuIntentSection) => {
    const file = luFileResolver(id);
    if (!file) throw new Error(fileNotFound(id));
    if (!intentName) throw new Error(INTENT_ERROR);

    return await dispatchers.updateLuIntent({ id: file.id, intentName, intent, projectId: state.projectId });
  };

  const renameLuIntent = async (id: string, intentName: string, newIntentName: string) => {
    const file = luFileResolver(id);
    if (!file) throw new Error(`lu file ${id} not found`);
    if (!intentName) throw new Error(`intentName is missing or empty`);

    const oldIntent = file.intents.find((i) => i.Name === intentName);
    if (!oldIntent) throw new Error(`intent not found with id ${intentName}`);

    const newIntent = { ...oldIntent, Name: newIntentName };

    return await dispatchers.updateLuIntent({ id: file.id, intentName, intent: newIntent, projectId: state.projectId });
  };

  const removeLuIntent = async (id: string, intentName: string) => {
    const file = luFileResolver(id);
    if (!file) throw new Error(fileNotFound(id));
    if (!intentName) throw new Error(INTENT_ERROR);

    return await dispatchers.removeLuIntent({ id: file.id, intentName, projectId: state.projectId });
  };

  const getLuIntents = (id: string): LuIntentSection[] => {
    if (id === undefined) throw new Error('must have a file id');
    const focusedDialogId = state.focusPath.split('#').shift() || id;
    const file = luFileResolver(focusedDialogId);
    if (!file) throw new Error(fileNotFound(id));
    return file.intents;
  };

  const getLuIntent = (id: string, intentName: string): LuIntentSection | undefined => {
    const file = luFileResolver(id);
    if (!file) throw new Error(fileNotFound(id));
    return file.intents.find(({ Name }) => Name === intentName);
  };

  return {
    addLuIntent,
    getLuIntents,
    getLuIntent,
    updateLuIntent,
    debouncedUpdateLuIntent: debounce(updateLuIntent, 250),
    renameLuIntent,
    removeLuIntent,
  };
}

export function useLuApi(projectId: string) {
  const focusPath = useRecoilValue(focusPathState(projectId));
  const dispatchers = useRecoilValue(dispatcherState);
  const { luFileResolver } = useResolvers(projectId);
  const [api, setApi] = useState(createLuApi({ focusPath, projectId }, dispatchers, luFileResolver));

  useEffect(() => {
    const newApi = createLuApi({ focusPath, projectId }, dispatchers, luFileResolver);
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
