/* eslint-disable react-hooks/rules-of-hooks */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CallbackInterface, useRecoilCallback } from 'recoil';

import httpClient from '../../utils/httpUtil';

import { botNameState } from './../atoms/botState';
import { logMessage } from './shared';

export const exportDispatcher = () => {
  const exportToZip = useRecoilCallback((callbackHelpers: CallbackInterface) => async ({ projectId }) => {
    const botName = await callbackHelpers.snapshot.getPromise(botNameState);
    try {
      const response = await httpClient.get(`/projects/${projectId}/export/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      link.setAttribute('download', `${botName}_export.zip`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      //TODO: error
      logMessage(callbackHelpers, err);
    }
  });

  return {
    exportToZip,
  };
};
