// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionCreator } from '../types';

import httpClient from './../../utils/httpUtil';
import { setError } from './error';

export const exportToZip: ActionCreator = async (store, { projectId }) => {
  const state = store.getState();
  try {
    const response = await httpClient.get(`/projects/${projectId}/export/`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    link.setAttribute('download', `${state.botName}_export.zip`);
    document.body.appendChild(link);
    link.click();
  } catch (err) {
    setError(store, {
      status: err.response.status,
      message: err.response && err.response.data.message ? err.response.data.message : err,
      summary: 'EXPORT ZIP ERROR'
    });
  }
};
