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

import { BASEURL, ActionTypes } from './../../constants';

export const fetchStorages: ActionCreator = async ({ dispatch }) => {
  try {
    const response = await axios.get(`${BASEURL}/storages`);
    dispatch({
      type: ActionTypes.GET_STORAGE_SUCCESS,
      payload: {
        response,
      },
    });
    return response.data;
  } catch (err) {
    dispatch({ type: ActionTypes.GET_STORAGE_FAILURE, payload: null, error: err });
  }
};

export async function fetchTemplates({ dispatch }) {
  try {
    const response = await axios.get(`${BASEURL}/assets/projectTemplates`);

    dispatch({
      type: ActionTypes.GET_TEMPLATE_PROJECTS_SUCCESS,
      payload: {
        response,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.GET_TEMPLATE_PROJECTS_FAILURE,
      error: err,
    });
  }
}

export const addNewStorage: ActionCreator = async ({ dispatch }, storageData) => {
  try {
    const response = await axios.post(`${BASEURL}/storages`, storageData);
    dispatch({
      type: ActionTypes.GET_STORAGE_SUCCESS,
      payload: {
        response,
      },
    });
  } catch (err) {
    dispatch({ type: ActionTypes.GET_STORAGE_FAILURE, payload: null, error: err });
  }
};

// todo: enable this if we have more storage, currently we only have one.
export const fetchStorageByName: ActionCreator = async ({ dispatch }, fileName) => {
  try {
    const response = await axios.get(`${BASEURL}/storage/${fileName}`);
    dispatch({
      type: ActionTypes.GET_STORAGE_SUCCESS,
      payload: {
        response,
      },
    });
  } catch (err) {
    dispatch({ type: ActionTypes.GET_STORAGE_FAILURE, payload: null, error: err });
  }
};

export const fetchFolderItemsByPath: ActionCreator = async ({ dispatch }, id, path) => {
  try {
    dispatch({
      type: ActionTypes.SET_STORAGEFILE_FETCHING_STATUS,
      payload: {
        status: 'pending',
      },
    });
    const response = await axios.get(`${BASEURL}/storages/${id}/blobs/${path}`);
    dispatch({
      type: ActionTypes.GET_STORAGEFILE_SUCCESS,
      payload: {
        response,
      },
    });
  } catch (err) {
    dispatch({
      type: ActionTypes.SET_STORAGEFILE_FETCHING_STATUS,
      payload: {
        status: 'failure',
      },
      error: err,
    });
  }
};
