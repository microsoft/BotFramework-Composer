// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import clonedeep from 'lodash/cloneDeep';
import { LuFile } from '@bfc/shared';

import * as luUtil from '../../utils/luUtil';
import { undoable } from '../middlewares/undo';
import { ActionCreator, State, Store } from '../types';
import luFileStatusStorage from '../../utils/luFileStatusStorage';
import { Text } from '../../constants';
import LuWorker from '../parsers/luWorker';
import { ActionTypes } from '../../constants';

import httpClient from './../../utils/httpUtil';

export const updateLuFile: ActionCreator = async (store, { id, projectId, content }) => {
  const result = (await LuWorker.parse(id, content)) as LuFile;
  store.dispatch({
    type: ActionTypes.UPDATE_LU,
    payload: { ...result, projectId },
  });
};

export const removeLuFile: ActionCreator = async (store, id) => {
  store.dispatch({
    type: ActionTypes.REMOVE_LU,
    payload: { id },
  });
};

export const createLuFile: ActionCreator = async (store, { id, content }) => {
  store.dispatch({
    type: ActionTypes.CREATE_LU,
    payload: { id, content },
  });
};

export const undoableUpdateLuFile = undoable(
  updateLuFile,
  (state: State, args: any[], isEmpty) => {
    if (isEmpty) {
      const id = args[0].id;
      const projectId = args[0].projectId;
      const content = clonedeep(state.luFiles.find((luFile) => luFile.id === id)?.content);
      return [{ id, projectId, content }];
    } else {
      return args;
    }
  },
  async (store: Store, from, to) => updateLuFile(store, ...to),
  async (store: Store, from, to) => updateLuFile(store, ...to)
);

export const updateLuIntent: ActionCreator = async (store, { projectId, file, intentName, intent }) => {
  const newContent = luUtil.updateIntent(file.content, intentName, intent);
  return await undoableUpdateLuFile(store, { id: file.id, projectId, content: newContent });
};

export const createLuIntent: ActionCreator = async (store, { projectId, file, intent }) => {
  const newContent = luUtil.addIntent(file.content, intent);
  return await undoableUpdateLuFile(store, { id: file.id, projectId, content: newContent });
};

export const removeLuIntent: ActionCreator = async (store, { projectId, file, intentName }) => {
  const newContent = luUtil.removeIntent(file.content, intentName);
  return await undoableUpdateLuFile(store, { id: file.id, projectId, content: newContent });
};

export const publishLuis: ActionCreator = async ({ dispatch, getState }, luisConfig, projectId) => {
  try {
    const { dialogs, luFiles } = getState();
    const referred = luUtil.checkLuisPublish(luFiles, dialogs);
    //TODO crosstrain should add locale
    const crossTrainConfig = luUtil.createCrossTrainConfig(dialogs, referred);
    const response = await httpClient.post(`/projects/${projectId}/luFiles/publish`, {
      luisConfig,
      projectId,
      crossTrainConfig,
      luFiles: referred.map((file) => file.id),
    });
    luFileStatusStorage.publishAll(getState().projectId);
    dispatch({
      type: ActionTypes.PUBLISH_LU_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.PUBLISH_LU_FAILED,
      payload: { title: Text.LUISDEPLOYFAILURE, message: err.response?.data?.message || err.message },
    });
  }
};
