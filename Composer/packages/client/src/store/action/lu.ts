/**
    Copyright (c) Microsoft. All rights reserved.
    Licensed under the MIT license.

    Microsoft Bot Framework: http://botframework.com

    Bot Framework Composer Github:
    https://github.com/Microsoft/BotFramwork-Composer

    Copyright (c) Microsoft Corporation
    All rights reserved.

    MIT License:
    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/
import axios from 'axios';

import { ActionCreator } from '../types';

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

export const publishLuis: ActionCreator = async ({ dispatch }, authoringKey) => {
  try {
    const response = await axios.post(`${BASEURL}/projects/opened/luFiles/publish`, { authoringKey });
    dispatch({
      type: ActionTypes.PUBLISH_LU_SUCCCESS,
      payload: { response },
    });
  } catch (err) {
    throw new Error(err.response.data.message);
  }
};
