import axios from 'axios';

import { ActionCreator, DialogSetting } from '../types';

import { BASEURL, ActionTypes } from './../../constants/index';

export const updateLuFile: ActionCreator = async ({ dispatch }, { id, content }) => {
  try {
    const response = await axios.put(`${BASEURL}/projects/opened/luFiles/${id}`, { id, content });
    dispatch({
      type: ActionTypes.UPDATE_LU_SUCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.UPDATE_LU_FAILURE,
      payload: null,
      error: err,
    });
    throw new Error(err.response.data.message);
  }
};

export const createLuFile: ActionCreator = async ({ dispatch }, { id, content }) => {
  try {
    const response = await axios.post(`${BASEURL}/projects/opened/luFiles`, { id, content });
    dispatch({
      type: ActionTypes.CREATE_LU_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.CREATE_LU_FAILURE,
      payload: null,
      // TODO, createReducer do not take this error now
      // we need to put it in payload
      error: err,
    });
  }
};

export const removeLuFile: ActionCreator = async ({ dispatch }, { id }) => {
  try {
    const response = await axios.delete(`${BASEURL}/projects/opened/luFiles/${id}`);
    dispatch({
      type: ActionTypes.REMOVE_LU_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.REMOVE_LU_FAILURE,
      payload: null,
      error: err,
    });
  }
};

export const publishLuis: ActionCreator = async ({ dispatch }) => {
  try {
    const response = await axios.post(`${BASEURL}/projects/opened/luFiles/publish`);
    dispatch({
      type: ActionTypes.PUBLISH_LU_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    throw new Error(err.response.data.message);
  }
};

export async function setLuisConfig(store, settings: DialogSetting, botName: string) {
  try {
    const config = settings.LuisConfig;
    await axios.post(`${BASEURL}/projects/opened/luFiles/config`, { config, botName });
  } catch (err) {
    store.dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        message: err.response && err.response.data.message ? err.response.data.message : err,
        summary: 'SET LUIS CONFIG ERROR',
      },
    });
  }
}
