// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator } from '../types';

import httpClient from './../../utils/httpUtil';
import { setError } from './error';

export const importLibrary: ActionCreator = async (store, { packageName, version }) => {
  const state = store.getState();
  const projectId = state.projectId;
  try {
    const response = await httpClient.post(`/projects/${projectId}/import`, { package: packageName, version: version });
    console.log('RESPONSE FROM IMPORT', response);
    // fire off a project reload to update the index, etc.
  } catch (err) {
    setError(store, {
      status: err.response.status,
      message: err.response && err.response.data.message ? err.response.data.message : err,
      summary: 'IMPORT ERROR',
    });
  }
};
